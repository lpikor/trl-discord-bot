require('dotenv').config();

const { Client, MessageEmbed, MessageCollector } = require('discord.js');
const client = new Client();

const Tesseract = require('tesseract.js');
// const { createWorker } = require('tesseract.js');
// const worker = createWorker({
//     logger: m => console.log(m)
//   });

const Jimp = require('jimp');

client.on('ready', () => {
    console.log(`${client.user.tag} logged in`);    
});

client.on('message', (message) => {
    if (message.attachments.size > 0) {
        let imageUrl;
        let result;
    
        message.attachments.forEach(attachment => {
            imageUrl = attachment.url;
        });
        
        Jimp.read(imageUrl).then(image => {
                image.greyscale()
                    .contrast(+1)    
                    .normalize()
                    .invert()
                    .write("img-opt.jpg");
        })
        .then(function() {
            Tesseract.recognize(
                'img-opt.jpg',
                'eng',
                {
                    tessedit_char_whitelist: '0123456789:.'
                },
                { logger: m => console.log(m) }
              ).then(({ data: { text } }) => {
                result = text;
              }).then(() => {
                //   console.log(result);
                  let regex = /[0-9][0-9]\:[0-9][0-9]\.[0-9][0-9][0-9]/g;
                  const found = result.match(regex).filter((item) =>{
                      return item !== '00:00.000';
                  });
                  console.log(found);
                  message.channel.send(`Player: ${message.author.tag}\nOverall time: ${found[0]}\nBest lap: ${found[1]}`);
              });
        })
        .catch(function (err) {
            console.error(err);
        });
    } else {
        message.channel.messages.fetch({ limit: 80 })
            .then(messages => {
                console.log(`Received ${messages.size} messages`);
                messages.forEach(item => {
                    console.log(item.content);
                });
            });
    }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
