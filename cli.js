#!/usr/bin/env node

const got = require('got');
const cheerio = require('cheerio');
const chalk = require('chalk');

const gotOptions = {
	headers: {
		'user-agent': `codersclan-scrap-cli/0.0.0 (https://github.com/panstav/codersclan-scrap-cli)`
	}
};

const argv = require('yargs')
	.usage('Usage: $ scrap-codersclan')
	.help('h')
	.alias('h', 'help')
	.wrap()
	.argv;

getOpenTasks()
	.then(printNicely)
	.catch(err => {
		console.error(err);
		console.error(err.stack);
	});

function getOpenTasks(){

	return got('https://www.codersclan.net/standard-tasks/', gotOptions)
		.then(parsesLinks)
		.then(scrapsLinks);

	function parsesLinks(resp){
		const $ = cheerio.load(resp.body);

		linksToTasks = $('.ticket')
			.find('.ticket-title a')
			.map((i, elem) => elem.attribs.href).get()
			.map(relativeLink => relativeLink.replace('..', 'https://www.codersclan.net'));

		return linksToTasks;
	}

	function scrapsLinks(links){
		return Promise.all(links.map(link => got(link, gotOptions).then(resp => parseTaskPage(resp, link))));
	}

	function parseTaskPage(resp, link){
		const $ = cheerio.load(resp.body);

		const h1 = $('h1').map((i, elem) => $(elem).text()).get();

		return { title: h1[0], reward: h1[1], link };
	}

}

function printNicely(results){
	results.forEach(result => {

		console.log(`\nTitle: ${chalk.red(result.title)}`);
		console.log(`Link: ${chalk.white(result.link)}`);
		console.log(`Reward: ${chalk.white(result.reward)}`);

	});
}