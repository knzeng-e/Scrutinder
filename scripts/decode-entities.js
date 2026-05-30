#!/usr/bin/env node
// One-shot script: decode HTML entities in data/measures.json and data/program.json
// All replacement characters use \uXXXX escapes to avoid source-encoding issues.
const fs   = require('fs')
const path = require('path')

const ENTITIES = {
  '&rsquo;':  '’', // right single quotation mark
  '&lsquo;':  '‘', // left single quotation mark
  '&apos;':   ''', // apostrophe
  '&amp;':    '&', // ampersand
  '&lt;':     '<', // less-than
  '&gt;':     '>', // greater-than
  '&nbsp;':   ' ', // non-breaking space
  '&ldquo;':  '“', // left double quotation mark
  '&rdquo;':  '”', // right double quotation mark
  '&hellip;': '…', // horizontal ellipsis
  '&mdash;':  '—', // em dash
  '&ndash;':  '–', // en dash
  '&laquo;':  '«', // left-pointing double angle quotation mark
  '&raquo;':  '»', // right-pointing double angle quotation mark
  '&eacute;': 'é', // e with acute
  '&Eacute;': 'É', // E with acute
  '&egrave;': 'è', // e with grave
  '&agrave;': 'à', // a with grave
  '&acirc;':  'â', // a with circumflex
  '&ecirc;':  'ê', // e with circumflex
  '&icirc;':  'î', // i with circumflex
  '&ocirc;':  'ô', // o with circumflex
  '&ucirc;':  'û', // u with circumflex
  '&ccedil;': 'ç', // c with cedilla
  '&Ccedil;': 'Ç', // C with cedilla
  '&oelig;':  'œ', // oe ligature
  '&OElig;':  'Œ', // OE ligature
  '&aelig;':  'æ', // ae ligature
  '&euml;':   'ë', // e with diaeresis
  '&iuml;':   'ï', // i with diaeresis
  '&ouml;':   'ö', // o with diaeresis
  '&uuml;':   'ü', // u with diaeresis
  '&auml;':   'ä', // a with diaeresis
}

function decodeStr(s) {
  if (typeof s !== 'string') return s
  var out = s
  for (var entity in ENTITIES) {
    if (Object.prototype.hasOwnProperty.call(ENTITIES, entity)) {
      out = out.split(entity).join(ENTITIES[entity])
    }
  }
  // numeric decimal &#NNN;
  out = out.replace(/&#(\d+);/g, function(_, n) { return String.fromCharCode(parseInt(n, 10)) })
  // numeric hex &#xHH;
  out = out.replace(/&#x([0-9a-fA-F]+);/g, function(_, h) { return String.fromCharCode(parseInt(h, 16)) })
  return out
}

function decodeDeep(v) {
  if (typeof v === 'string') return decodeStr(v)
  if (Array.isArray(v)) return v.map(decodeDeep)
  if (v && typeof v === 'object') {
    var out = {}
    for (var k in v) {
      if (Object.prototype.hasOwnProperty.call(v, k)) out[k] = decodeDeep(v[k])
    }
    return out
  }
  return v
}

function processFile(rel) {
  var file  = path.join(__dirname, '..', rel)
  var raw   = JSON.parse(fs.readFileSync(file, 'utf8'))
  var clean = decodeDeep(raw)
  fs.writeFileSync(file, JSON.stringify(clean, null, 2) + '\n', 'utf8')

  var still = fs.readFileSync(file, 'utf8').match(/&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/g)
  var count = Array.isArray(raw) ? raw.length : Object.keys(raw).length
  if (still) {
    console.warn('  WARN  ' + rel + ': ' + still.length + ' entities remain: ' + JSON.stringify([...new Set(still)]))
  } else {
    console.log('  OK    ' + rel + ': ' + count + ' records cleaned, 0 entities remaining')
  }
}

processFile('data/measures.json')
processFile('data/program.json')
