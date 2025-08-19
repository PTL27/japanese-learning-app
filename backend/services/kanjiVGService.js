const axios = require('axios');
const xml2js = require('xml2js');

class KanjiVGService {
  constructor() {
    this.baseUrl = 'https://github.com/KanjiVG/kanjivg/raw/master/kanji';
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true
    });
  }

  // Convert kanji character to Unicode codepoint in hex format
  getUnicodeHex(kanji) {
    return kanji.codePointAt(0).toString(16).padStart(5, '0');
  }

  // Get SVG URL for a kanji character
  getKanjiVGUrl(kanji) {
    const unicodeHex = this.getUnicodeHex(kanji);
    return `${this.baseUrl}/${unicodeHex}.svg`;
  }

  // Fetch and parse KanjiVG SVG data
  async fetchKanjiStrokes(kanji) {
    try {
      console.log(`Fetching stroke data for kanji: ${kanji}`);
      
      const url = this.getKanjiVGUrl(kanji);
      console.log(`KanjiVG URL: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Japanese Learning App - Educational Use'
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse SVG XML
      const svgData = await this.parser.parseStringPromise(response.data);
      
      if (!svgData || !svgData.svg) {
        throw new Error('Invalid SVG data structure');
      }

      // Extract stroke information
      const strokeData = this.extractStrokeData(svgData, kanji);
      
      console.log(`Successfully extracted ${strokeData.strokes.length} strokes for ${kanji}`);
      
      return strokeData;

    } catch (error) {
      console.error(`Error fetching stroke data for ${kanji}:`, error.message);
      
      if (error.response) {
        // HTTP error responses
        if (error.response.status === 404) {
          throw new Error(`Kanji ${kanji} not found in KanjiVG database`);
        } else {
          throw new Error(`HTTP ${error.response.status}: Failed to fetch from KanjiVG`);
        }
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error: Unable to connect to KanjiVG');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Request timeout: KanjiVG server did not respond');
      } else {
        throw error;
      }
    }
  }

  // Extract stroke paths and metadata from SVG data
  extractStrokeData(svgData, kanji) {
    try {
      const svg = svgData.svg;
      const strokes = [];
      const groups = [];

      // Find all path elements (these are the actual strokes)
      this.findPaths(svg, strokes, []);
      
      // Find all groups for stroke order information
      this.findGroups(svg, groups, []);

      // Create stroke metadata
      const strokeMetadata = {
        kanji: kanji,
        unicode: this.getUnicodeHex(kanji),
        totalStrokes: strokes.length,
        viewBox: svg.viewBox || '0 0 109 109',
        xmlns: svg.xmlns || 'http://www.w3.org/2000/svg',
        strokes: strokes.map((stroke, index) => ({
          id: index + 1,
          path: stroke.d,
          strokeOrder: index + 1,
          // Additional metadata if available
          element: stroke.element || null,
          type: stroke.type || null,
          part: stroke.part || null,
          original: stroke.original || null,
          position: stroke.position || null,
          radical: stroke.radical || null,
          phon: stroke.phon || null
        })),
        groups: groups,
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'KanjiVG',
          url: this.getKanjiVGUrl(kanji)
        }
      };

      return strokeMetadata;

    } catch (error) {
      console.error('Error extracting stroke data:', error);
      throw new Error(`Failed to extract stroke data: ${error.message}`);
    }
  }

  // Recursively find all path elements
  findPaths(node, paths, context) {
    if (!node) return;

    // If this node is a path element
    if (node.d) {
      paths.push({
        d: node.d,
        id: node.id || null,
        element: node['kvg:element'] || context.element || null,
        type: node['kvg:type'] || context.type || null,
        part: node['kvg:part'] || context.part || null,
        original: node['kvg:original'] || context.original || null,
        position: node['kvg:position'] || context.position || null,
        radical: node['kvg:radical'] || context.radical || null,
        phon: node['kvg:phon'] || context.phon || null
      });
    }

    // Create new context for child elements
    const newContext = {
      element: node['kvg:element'] || context.element,
      type: node['kvg:type'] || context.type,
      part: node['kvg:part'] || context.part,
      original: node['kvg:original'] || context.original,
      position: node['kvg:position'] || context.position,
      radical: node['kvg:radical'] || context.radical,
      phon: node['kvg:phon'] || context.phon
    };

    // Recursively search in child elements
    if (node.g) {
      if (Array.isArray(node.g)) {
        node.g.forEach(child => this.findPaths(child, paths, newContext));
      } else {
        this.findPaths(node.g, paths, newContext);
      }
    }

    if (node.path) {
      if (Array.isArray(node.path)) {
        node.path.forEach(child => this.findPaths(child, paths, newContext));
      } else {
        this.findPaths(node.path, paths, newContext);
      }
    }
  }

  // Find group information for stroke structure
  findGroups(node, groups, context) {
    if (!node) return;

    // If this is a group with KanjiVG attributes
    if (node['kvg:element'] || node['kvg:type'] || node['kvg:part']) {
      groups.push({
        id: node.id || null,
        element: node['kvg:element'] || null,
        type: node['kvg:type'] || null,
        part: node['kvg:part'] || null,
        original: node['kvg:original'] || null,
        position: node['kvg:position'] || null,
        radical: node['kvg:radical'] || null,
        phon: node['kvg:phon'] || null
      });
    }

    // Recursively search in child elements
    if (node.g) {
      if (Array.isArray(node.g)) {
        node.g.forEach(child => this.findGroups(child, groups, context));
      } else {
        this.findGroups(node.g, groups, context);
      }
    }
  }

  // Validate if character is a valid kanji
  isValidKanji(char) {
    if (!char || char.length !== 1) return false;
    
    const code = char.codePointAt(0);
    
    // Check if it's in common kanji Unicode ranges
    return (
      (code >= 0x4E00 && code <= 0x9FAF) ||  // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4DBF) ||  // CJK Extension A
      (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
      (code >= 0x2A700 && code <= 0x2B73F) || // CJK Extension C
      (code >= 0x2B740 && code <= 0x2B81F) || // CJK Extension D
      (code >= 0x2B820 && code <= 0x2CEAF)    // CJK Extension E
    );
  }

  // Get stroke count estimate from paths
  getStrokeCount(strokeData) {
    return strokeData.strokes ? strokeData.strokes.length : 0;
  }

  // Generate a simplified SVG for display
  generateDisplaySVG(strokeData) {
    const { viewBox, xmlns, strokes } = strokeData;
    
    let svg = `<svg viewBox="${viewBox}" xmlns="${xmlns}">`;
    
    strokes.forEach(stroke => {
      svg += `<path d="${stroke.path}" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    
    svg += '</svg>';
    
    return svg;
  }
}

module.exports = new KanjiVGService();