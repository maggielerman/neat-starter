const yaml = require("js-yaml");
const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const htmlmin = require("html-minifier");
const Image = require("@11ty/eleventy-img");

async function pngShortcode(src, alt, sizes, cls) {
  let metadata = await Image(src, {
    widths: [400, 800, 1200, 1600, null],
    formats: ["webp", "avif", null],
    urlPath: "/static/img/responsive",
    outputDir: "_site/static/img/responsive",
    useCache: true,
  });

  let imageAttributes = {
    alt,
    class: cls,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return Image.generateHTML(metadata, imageAttributes);
}


async function imageShortcode(src, alt, sizes, cls, style) {
  let metadata = await Image(src, {
    widths: [ 800, 1200],
    formats: ["jpeg", "webp", "png", "avif"],
    urlPath: "/static/img/responsive",
    outputDir: "_site/static/img/responsive",
   
  });

  let imageAttributes = {
    alt,
    class: cls,
    style,
    sizes,
    loading: "lazy",
    decoding: "async",
  };
  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
  // Disable automatic use of your .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Merge data instead of overriding
  eleventyConfig.setDataDeepMerge(true);

  // human readable date
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  // Syntax Highlighting for Code blocks
  eleventyConfig.addPlugin(syntaxHighlight);

  // To Support .yaml Extension in _data
  // You may remove this if you can use JSON
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  // Copy Static Files to /_Site
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/alpinejs/dist/cdn.min.js": "./static/js/alpine.js",
    "./node_modules/prismjs/themes/prism-tomorrow.css":
      "./static/css/prism-tomorrow.css",
  });

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static/img");

   //image shortcodes
   eleventyConfig.addNunjucksAsyncShortcode("png", pngShortcode);
   eleventyConfig.addLiquidShortcode("png", pngShortcode);
   eleventyConfig.addJavaScriptFunction("png", pngShortcode);
 
   eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
   eleventyConfig.addLiquidShortcode("image", imageShortcode);
   eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  // Copy favicon to route of /_site
  eleventyConfig.addPassthroughCopy("./src/favicon.ico");

  // Minify HTML
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  // Let Eleventy transform HTML files as nunjucks
  // So that we can use .html instead of .njk
  return {
    dir: {
      input: "src",
    },
    htmlTemplateEngine: "njk",
  };
};
