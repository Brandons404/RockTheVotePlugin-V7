const utils = require('helper');
importPackage(Packages.arc);

let enabled = true;
let votes = [];
const ratio = 0.6;

Events.on(PlayerLeave, (e) => {
  const player = e.player;
  const pid = player.uuid();

  if (votes.includes(pid)) {
    votes = votes.filter((id) => id !== pid);
    const currentVotes = votes.length;
    const requiredVotes = Math.ceil(ratio * Groups.player.size());
    Call.sendMessage(
      'RTV: [accent]' +
        player.name +
        '[] left, [green]' +
        currentVotes +
        '[] votes, [green]' +
        requiredVotes +
        '[] required'
    );
  }
});

Events.on(GameOverEvent, (e) => {
  votes = [];
});

Events.on(ServerLoadEvent, (e) => {
  const clientCommands = Vars.netServer.clientCommands;
  const runner = (method) => new Packages.arc.util.CommandHandler.CommandRunner({ accept: method });

  clientCommands.register(
    'rtv',
    '[off]',
    'Rock the vote to change map',
    runner((args, player) => {
      if (player.admin) {
        enabled = args.length != 1 || !args[0] === 'off';
      }

      if (!enabled) {
        player.sendMessage('RTV: RockTheVote is disabled');
        return;
      }

      if (votes.includes(player.uuid())) {
        let currentVotes = votes.length;
        let requiredVotes = Math.ceil(ratio * Groups.player.size());
        Call.sendMessage(
          'RTV: [accent]' +
            player.name +
            '[] wants to change the map, [green]' +
            currentVotes +
            '[] votes, [green]' +
            requiredVotes +
            '[] required'
        );
        return;
      }

      votes.push(player.uuid());
      let currentVotes = votes.length;
      let requiredVotes = Math.ceil(ratio * Groups.player.size());
      Call.sendMessage(
        'RTV: [accent]' +
          player.name +
          '[] wants to change the map, [green]' +
          currentVotes +
          '[] votes, [green]' +
          requiredVotes +
          '[] required'
      );

      if (currentVotes < requiredVotes) {
        return;
      }

      votes = [];
      Call.sendMessage('RTV: [green] vote passed, changing map.');
      Events.fire(new GameOverEvent(Team.crux));
    })
  );
});
