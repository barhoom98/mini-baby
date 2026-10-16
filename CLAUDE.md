# MINI BABY - Claude Code notes

- This is an Arabic (RTL) storefront for baby clothes, essentials, and accessories. Keep the experience mobile-friendly and accessible. The mannequin preview uses the supplied product photos; do not recreate or recolor clothing with CSS/SVG or describe it as a 3D fitting.
- Store branding, currency, WhatsApp number, category labels, product descriptions, sizes, prices, colors, and image paths live in `store.js`.
- Place product photos in `assets/products/` and set each product's `image` to its relative path, such as `assets/products/soft-romper.jpg`. Extra photos (e.g. fabric close-ups) go in the optional `gallery` array and show as thumbnails. Background-removed `.png` cut-outs are shown contained; other photos fill the frame.
- Replace the demo catalog and demo prices before publishing. Do not invent real stock, material, delivery, or payment claims.
- The cart is stored in the visitor's browser and checkout sends the order summary to the configured WhatsApp number. No online payment or central order database is included.
- The mannequin image is a static product photo, not a 3D model or a size-accurate fitting tool.
