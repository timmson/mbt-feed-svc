const config = require("./config").instagram;
const Client = require("instagram-private-api").IgApiClient;
const inquirer = require("inquirer");


async function login() {
	const client = new Client();
	client.state.generateDevice(config.username);

	try {
		await client.simulate.preLoginFlow();
		/*const loggedInUser =*/
		await client.account.login(config.username, config.password);
		process.nextTick(async () => await client.simulate.postLoginFlow());
		return await client.feed.tag(config.tag).items();
	} catch (err) {
		console.log(err);
		console.log(client.state.checkpoint); // Checkpoint info here
		await client.challenge.auto(true); // Requesting sms-code or click "It was me" button
		console.log(client.state.checkpoint); // Challenge info here
		const {code} = await inquirer.prompt([
			{
				type: 'input',
				name: 'code',
				message: 'Enter code',
			},
		]);
		console.log(await client.challenge.sendSecurityCode(code));
	}
}

login().then((r) => console.log(r));

