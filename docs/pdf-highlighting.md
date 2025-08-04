# PDF Keyword Highlighting

This document explains how to highlight keywords in a PDF using [`pdf.js`](https://mozilla.github.io/pdf.js/).

The typical issue occurs when highlight rectangles are calculated directly from character indices without applying the page's transformation matrix. The text on screen appears correct, but when you draw highlights in the PDF layer they are offset, resulting in wrong locations.

## Recommended approach

1. **Extract text items** using `page.getTextContent()`.
2. **Normalize** each item by replacing multiple spaces and handling line breaks so that the search term matches the extracted text exactly.
3. For every match, compute the rectangle using the item's width and height:
   ```js
   const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
   const [x, y] = transform;
   const charWidth = item.width / item.str.length;
   const rect = {
     x: x + charWidth * match.index,
     y: y - item.height,
     width: charWidth * match[0].length,
     height: item.height,
   };
   ```
   Apply the rectangle to the annotation or canvas with the same viewport transform.
4. **Apply the viewport transformation** when drawing the highlight so the coordinates line up with the rendered text.
5. Repeat for all pages.

By always using the page's transform and per‑character width, the highlight will coincide with the exact characters that were matched.
