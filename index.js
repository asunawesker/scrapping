const express = require('express');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Champion = require("./championModel");

const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hola mundo!'));

app.listen(port, () => console.log(`App de ejemplo escuchando el puerto ${port}!`));

const mongoUrl = 'mongodb+srv://asunawesker:yamaha112@scrapping.p01tu.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoUrl, { useNewUrlParser: true });
var db = mongoose.connection;

!db ? console.log("Hubo un error conectandose a la base de datos") : console.log("Conexión a base de datos satisfactoria");

app.get('/scrapping', function (req, res) {
  
    let scrape = async () => {
 
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto('https://raid-codex.com/champions', [
          1000,
          { waitUntil: 'domcontentloaded' }
        ]);
    
        const parentRow = 'body > main > champion-list > div';
        await page.waitForSelector(parentRow);
        //const totalChampions = await page.$eval(parentRow, el => el.childElementCount);
        const totalChampions = 10;
    
        let championList = [];
        for (var i = 1; i <= totalChampions; i++) {
            console.log(`Process: ${i} of ${totalChampions}`)
        
            let elementToClick = `body > main > champion-list > div > div:nth-child(${i}) > a > picture > img`;
            await page.waitForSelector(elementToClick);
        
            await Promise.all([
                page.click(elementToClick),
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
            ])
        
            const result = await page.evaluate(() => {
                let nameChamp = document.querySelector('body > main > div > div.col-12.text-center.mb-3 > h1').innerHTML;
                let health = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(1) > div:nth-child(2)').innerHTML
                let attack = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(2) > div:nth-child(2)').innerHTML;
                let defense = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(3) > div:nth-child(2)').innerHTML;
                let criticalRate = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(4) > div:nth-child(2)').innerHTML;
                let criticalDamage = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(5) > div:nth-child(2)').innerHTML;
                let speed = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(6) > div:nth-child(2)').innerHTML;
                let resistance = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(7) > div:nth-child(2)').innerHTML;
                let accuracy = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(8) > div:nth-child(2)').innerHTML;
                let rarity = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > span').innerHTML
                let faction = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > a').innerHTML
                let type = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(5) > div:nth-child(2)').innerHTML
                let element = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(6) > div:nth-child(2)').innerHTML
        
                let championModel = {
                    nameChamp: nameChamp,
                    rarity: rarity,
                    faction: faction,
                    type: type,
                    element: element,
                    stats: {
                        health: health,
                        attack: attack,
                        defense: defense,
                        criticalRate: criticalRate,
                        criticalDamage: criticalDamage,
                        speed: speed,
                        resistance: resistance,
                        accuracy: accuracy
                    }
                }
        
                return championModel;
            })
            console.info('championModel ->', result)
        
            championList.push(result);
            await page.goBack([5000, { waitUntil: 'domcontentloaded' }]);
        }
    
        browser.close();
        return championList;
    }
    
    scrape().then(value => {    
		Champion.create(value, function (err, small) {
			if (err) return handleError(err);
			// saved!
		});
		res.send(value);
		return;
	});
})