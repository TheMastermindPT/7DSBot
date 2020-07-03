const Discord = require('discord.js');
module.exports = {
	name: 'gear',
	description: 'Latest patch notes for 7DSGS',
	execute(message, args) {
            const capitalize = (s) => {
                if (typeof s !== 'string') return '';
                return s.charAt(0).toUpperCase() + s.slice(1);
            }

            const type = args[0].toString();
            let baseStat = parseInt(args[1]);
            
            const sendEmbed = (min, max) => {
                const percent = ((baseStat - min) * 100) / (max - min);
                const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#821d01')
                .setTitle('Should I awaken?')
                .setThumbnail('https://i.imgur.com/GkL1l0N.jpg?1')
                .addFields(
                { name: 'Type', value: capitalize(type)},
                { name: 'Base Stat', value : baseStat},
                { name : 'min', value : min},
                { name : 'max', value : max},
                { name : 'percent', value : `${percent.toFixed(1)}%`},
                { name : 'Should I awaken?', value : percent >= 90 ? 'Yes' : 'No'}
                )
                .setTimestamp()
                message.channel.send(exampleEmbed);
            }

            switch (args[0]) {
                case 'bracer':
                    min = 390;
                    max = 520;
                    if(baseStat >= min && baseStat <= max) {
                        sendEmbed(min, max);
                        return;
                    }
                    message.channel.send('Insert a correct base stat value!');
                    break;
                case 'neck':
                    min = 195;
                    max = 260;
                    if(baseStat >= min && baseStat <= max) {
                        sendEmbed(min, max);
                        return;
                    }
                    message.channel.send('Insert a correct base stat value!');
                    break;
                case 'belt':
                    min = 3900;
                    max = 5200;
                    if(baseStat >= min && baseStat <= max) {
                        sendEmbed(min, max);
                        return;
                    }
                    message.channel.send('Insert a correct base stat value!');
                    break;
                case 'ring' :
                    min = 210;
                    max = 280;
                    if(baseStat >= min && baseStat <= max) {
                        sendEmbed(min, max);
                        return;
                    }
                    message.channel.send('Insert a correct base stat value!');
                    break;
                case 'ear':
                    min = 105;
                    max = 140;
                    if(baseStat >= min && baseStat <= max) {
                        sendEmbed(min, max);
                        return;
                    }
                    message.channel.send('Insert a correct base stat value!');
                    break;
                case 'rune': 
                    min = 2100;
                    max = 2800;
                    if(baseStat >= min && baseStat <= max) {
                        sendEmbed(min, max);
                        return;
                    }
                    message.channel.send('Insert a correct base stat value!');
                    break;  
                default:
                    message.channel.send(`Insert a valid gear type. Ex: bracer, neck, belt, ring, ear, rune`);
            }
	},
};