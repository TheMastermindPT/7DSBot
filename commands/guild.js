// GOOGLE STUFF//
const Discord = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const e = require('express');

// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('18g1jJoEYV40skkuq9T5OW_UojGmG1g5D14jO6owBgJg');

const date = new Date();
const day = date.toLocaleString('default', { day: 'numeric'});
const month = date.toLocaleString('default', { month: 'numeric'});
const monthName = date.toLocaleString('default', { month: 'long'});
const monthIndex = {
 "7": 0,
 "8": 1,
 "9": 2,
 "10": 3,
 "11": 4,
 "12": 5,
 "1": 6,
 "2": 7,
 "3": 8,
 "4": 9,
 "5": 10,
 "6": 11,
}
const weeks = {
  'Week 1' : ["1","2","3","4","5","6","7"],
  'Week 2' : ["8","9","10","11","12","13","14"],
  'Week 3' : ["15","16","17","18","19","20","21"],
  'Week 4' : ["22","23","24","25","26","27","28","29","30","31"]
}

let weekNumber;
let sheetIndex;

async function authenticate() {
  try {
    await doc.useServiceAccountAuth(require('../configs/client_secret.json'));
    await doc.loadInfo(); // loads document properties and worksheets
    /* console.log(doc.sheetsById); */
    return;
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
	name: 'guild',
  description: 'Spreadsheet functions...',
	execute(message, args) {
    
    (async function () {
        for(m of Object.entries(monthIndex)) {
          if(m[0] === month) {
            sheetIndex = m[1];
          }
        }
        
        for (week of Object.entries(weeks)) {
          for(days of Object.values(week)[1]) {
            if (days === day) {
              weekNumber = this.week[0];
            }
          }
        }

        await authenticate();
        let roster = await doc.sheetsById[346544522];
        let sheet = await doc.sheetsByIndex[sheetIndex];
        let members = [];
        await roster.loadCells('A1:A30'); // A1 range
        let weekStats = { 'Week' : weekNumber, 'cp': [], 'contribution': [], 'days' : []};
        const strikeColumns = ['N', 'O', 'P', 'Q', 'R', 'S', 'T'];

        const pushStats = (cells, cpColumn, gbColumn, strikeColumns,  startIndex) => {
            for (i = 0; i < 30; i++) {
              weekStats.cp.push(cells.getCellByA1(`${cpColumn}${i + startIndex}`).formattedValue);
              weekStats.contribution.push(cells.getCellByA1(`${gbColumn}${i + startIndex}`).formattedValue);
              let colors = []; 

              for(column of strikeColumns) {
                if(strikeColumns.indexOf(column) <= 7) {
                  colors.push(cells.getCellByA1(`${column}${i + startIndex}`).backgroundColor);
                }
              }
            
              weekStats.days.push(colors);    
          } 
        }

        for (i = 0; i < 30; i++ ) {
          members.push({name: roster.getCellByA1(`A${i+1}`).formattedValue});
        }

        switch(weekNumber) {
          case 'Week 1':
            await sheet.loadCells('B4:K33');
            console.log('Week 1');
            pushStats(sheet, 'J', 'K', 4);
            break;
          case 'Week 2':
            await sheet.loadCells('M4:V33');
            console.log('Week 2');
            pushStats(sheet, 'U', 'V', strikeColumns, 4);
            break;
          case 'Week 3':
            await sheet.loadCells('B38:K67'); 
            console.log('Week 3');
            pushStats(sheet, 'J', 'K', strikeColumns, 38);
            break;
          case 'Week 4':
            await sheet.loadCells('M38:V67');
            console.log('Week 4');
            pushStats(sheet, 'U', 'V', 38);
            break;
          default:
            console.log('This week is non-existent');
            break;
        }
        
        for (member in members) {
          members[member].CP = weekStats.cp[member];
          members[member].GB = weekStats.contribution[member];
          members[member].days = weekStats.days[member];
          members[member].strike = false;
        }

        
        const regex = /^(new|0)/gim;
        
        const filtered = members.filter((member) => {
          if(member.name){
            if(member.CP === '-' || !member.CP ) {
               member.CP = "0";
            } 
            if (member.GB.match(regex)) {
             member.GB = "0";
            } 
            
            member.CP = parseFloat(parseFloat(member.CP.replace(/,/g, ".")).toFixed(1));
            member.GB = parseInt(member.GB.replace(/,/g, "."));
            return member;
          }
        });

        if(args[0] === 'strike') {
          const whoFailedIndex = [{'index': '', times : 0}];
          let times = 0;
          let days = 0;
          let membersWhoFailed = [];

          for (member of filtered) {
            let failed = member.days.map((element,index)=> {
              // Resets Check-ins every week and counts how many times someone didnt
              if(days <= 7 ) {
                
                days++;

                if(days === 7) {
                  times = 0;
                }

                if(element.red === 1) {
                  times++;

                  if(times === 3) {
                    member.strike = true;
                  }

                  return true;
                }
                return false;
              }
                days = 0;
            });
           
            
            failed = failed.filter(el => el ? el : false);

            
            if(member.strike) {
              message.channel.send(`${member.name} got a strike.`);
            }
          }
          
        }


        if (args[0] === 'members') {

          if(args[1] === 'mcp') {
           let sum = 0;
           const memSum = filtered.length;  
           for (member of filtered) {
              sum += member.CP;
           }
            message.channel.send(`Median CP of Clover-HS : ${(sum/memSum).toFixed(3)}K`);
          }

          if(args[1] === 'mgb') {
            let sum = 0;
            const memSum = filtered.length;  
            for (member of filtered) {
               sum += member.GB;
            }
             message.channel.send(`Median GB points of Clover-HS : ${(sum/memSum).toFixed(1)}K`);
           }
 

          function mostCP( a, b ) {
           if ( a.CP < b.CP) {
             return 1;
           }
           return -1;
          }

          function mostGB( a, b ) {
           if ( a.GB < b.GB) {
             return 1;
           }
           return -1;
          }

          const regex2 = /(tcp|bcp|tgb|bgb)/gm;

          if(regex2.test(args[1])){
            const sendEmbed = (filtered) => {
              const exampleEmbed = new Discord.MessageEmbed()
             .setColor('#821d01')
             .setThumbnail('https://imgur.com/AADFtyL.jpg');
              if(args[1] === 'tcp') {
                sortCP = filtered.sort(mostCP);
                let removed = sortCP.splice(10);
                for (member of sortCP) {
                  exampleEmbed.setTitle(`Guild Top 10/ ${weekNumber} of ${monthName} by CP`)
                  exampleEmbed.addFields({name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true});
                } 
              } else if (args[1] === 'bcp') {
                sortCP = filtered.sort(mostCP);
                let removed = sortCP.splice(sortCP.length - 10);
                for (member of removed) {
                  exampleEmbed.setTitle(`Guild Bottom 10/ ${weekNumber} of ${monthName} by CP`)
                  exampleEmbed.addFields({name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true});
                } 
              }
              if(args[1] === 'tgb') {
                sortGB = filtered.sort(mostGB);
                let removed = sortGB.splice(10);
                for (member of sortGB) {
                  exampleEmbed.setTitle(`Guild Top 10/ ${weekNumber} of ${monthName} by GB`)
                  exampleEmbed.addFields({name: member.name, value: `CP: ${member.CP} GB: ${member.GB}`, inline: true});
                }
              } else if (args[1] === 'bgb') {
                sortGB = filtered.sort(mostGB);
                let removed = sortGB.splice(sortGB.length - 10);
                for (member of removed) {
                  exampleEmbed.setTitle(`Guild Bottom 10/ ${weekNumber} of ${monthName} by CP`)
                  exampleEmbed.addFields({name: member.name, value: `CP: ${member.CP}K GB: ${member.GB}`, inline: true});
                } 
              }
              message.channel.send(exampleEmbed);
            }      
            sendEmbed(filtered);
            return;
          } 
        }
    })();
  },
};
 