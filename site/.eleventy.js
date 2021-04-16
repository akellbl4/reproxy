const fs = require('fs')
const path = require('path')
const htmlmin = require('html-minifier')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const toc = require('@thedigitalman/eleventy-plugin-toc-a11y')
const fns = require('date-fns')

function getVersion() {
	return `reproxy-${Date.now()}`
}

function transformHTML(content, outputPath) {
	if (!outputPath?.endsWith('.html')) {
		return content
	}

	return htmlmin.minify(content, {
		useShortDoctype: true,
		removeComments: true,
		collapseWhitespace: true,
	})
}

function transformMarkdown() {
	return markdownIt({
		html: true,
		breaks: true,
		linkify: true,
	}).use(markdownItAnchor, {
		permalink: true,
		permalinkClass: '',
		permalinkSymbol: '',
	})
}

function replaceLogo(content) {
	const filepath = path.resolve(__dirname, './src/logo.svg')
	const svg = fs.readFileSync(filepath, 'utf-8')

	return content.replace(/<img class="logo"(.*?)>/gi, svg)
}

function getReadableDate(date) {
	return fns.format(new Date(date), 'LLL dd, yyyy')
}

function getISODate(date) {
	return fns.format(new Date(date), 'yyyy-mm-dd')
}

module.exports = (config) => {
	config.addShortcode('version', getVersion)

	// Pluigns
	config.addPlugin(toc, {
		tags: ['h2', 'h3'],
		heading: false,
		listType: 'ul',
		wrapperClass: 'docs-nav',
		listClass: 'pl-5',
		listItemClass: 'mb-2',
		listItemAnchorClass:
			'inline-block p-1 hover:text-gray-900 dark:hover:text-gray-200',
	})

	// HTML transformations
	config.addTransform('replaceLogo', replaceLogo)
	config.addTransform('htmlmin', transformHTML)
	// Date formaters
	config.addFilter('humanizeDate', getReadableDate)
	config.addFilter('isoDate', getISODate)

	// Markdown
	config.setLibrary('md', transformMarkdown())

	// Other files
	config.addPassthroughCopy({ 'src/public/*': '.' })

	return {
		dir: {
			input: 'src',
			output: 'public',
			data: 'data',
			layouts: 'layouts',
			includes: 'includes',
		},
	}
}
