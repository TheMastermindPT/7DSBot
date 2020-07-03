const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	name: 'patch',
	description: 'Latest patch notes for 7DSGS',
	execute(message, args) {
		
			const exampleEmbed = new Discord.MessageEmbed()
			.setColor('#821d01')
			.setTitle('Latest Patch Notes')
			.setURL('http://forum.netmarble.com/7ds_en/view/1/32033')
			.setThumbnail('https://i.imgur.com/rK3s1rs.jpg')
			.addFields(
			{ name: 'Patch notes', value: '' },
			)
			.setTimestamp()
			message.channel.send(exampleEmbed);
	},
};