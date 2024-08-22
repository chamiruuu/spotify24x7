const { Client, Intents } = require('discord.js');
const SpotifyWebApi = require('spotify-web-api-node');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const spotifyApi = new SpotifyWebApi({
    clientId: 'your-spotify-client-id',
    clientSecret: 'your-spotify-client-secret',
    redirectUri: 'http://localhost:8888/callback'
});

const DISCORD_TOKEN = 'your-discord-bot-token'; // Replace with your Discord bot token
const CHANNEL_ID = 'your-discord-channel-id'; // Replace with your Discord voice channel ID

let accessToken = '';

async function authenticateSpotify() {
    const data = await spotifyApi.clientCredentialsGrant();
    accessToken = data.body['access_token'];
    spotifyApi.setAccessToken(accessToken);
}

async function playRandomTrack(voiceChannel) {
    const result = await spotifyApi.getPlaylistTracks('37i9dQZF1DXcBWIGoYBM5M'); // Example playlist
    const tracks = result.body.items;
    if (tracks.length > 0) {
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)].track;
        const trackUrl = `https://open.spotify.com/track/${randomTrack.id}`;
        console.log(`Playing ${randomTrack.name} by ${randomTrack.artists[0].name}`);

        const connection = await voiceChannel.join();
        // Streaming Spotify directly isn't supported; usually, you need to use a service to convert Spotify to a compatible format or use an API that provides audio streaming.
        // For example, use a placeholder URL or an alternative service to get the track.
        const stream = ytdl(trackUrl, { filter: 'audioonly' });
        const dispatcher = connection.play(stream);

        dispatcher.on('finish', () => {
            voiceChannel.leave();
            setTimeout(() => playRandomTrack(voiceChannel), 10000); // Wait 10 seconds before playing next track
        });

        dispatcher.on('error', console.error);
    }
}

client.once('ready', async () => {
    console.log('Bot is online!');
    await authenticateSpotify();
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        playRandomTrack(channel);
    }
});

client.login(DISCORD_TOKEN);
