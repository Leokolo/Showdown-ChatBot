/**
 * Teambuilder / Teams Manager
 */

'use strict';

const Path = require('path');

const DataBase = Tools.get('json-db.js');
const Text = Tools.get('text.js');
const Teams = Tools.get('teams.js');

const teamsDataBase = new DataBase(Path.resolve(App.confDir, 'teams.json'));

exports.setup = function (App) {
	module.exports = {
		teams: {},
		dynTeams: {},

		loadTeamList: function () {
			this.dynTeams = teamsDataBase.data;
			this.mergeTeams();
		},

		mergeTeams: function () {
			if (this.teams) delete this.teams;
			this.teams = {};
			for (let i in this.dynTeams) {
				let team = this.dynTeams[i];
				if (!this.teams[team.format]) this.teams[team.format] = [];
				this.teams[team.format].push(team.packed);
			}
		},

		addTeam: function (name, format, packed) {
			if (this.dynTeams[name]) return false;
			this.dynTeams[name] = {
				format: format,
				packed: packed,
			};
			this.mergeTeams();
			this.saveTeams();
			return true;
		},

		removeTeam: function (name) {
			if (!this.dynTeams[name]) return false;
			delete this.dynTeams[name];
			this.mergeTeams();
			this.saveTeams();
			return true;
		},

		saveTeams: function () {
			teamsDataBase.write();
		},

		getTeam: function (format) {
			let formatId = Text.toId(format);
			let teamStuff = this.teams[formatId];
			if (!teamStuff || !teamStuff.length) return false;
			let teamChosen = teamStuff[Math.floor(Math.random() * teamStuff.length)]; //choose team
			let teamStr = '';
			try {
				if (typeof teamChosen === 'string') {
				//already parsed
					teamStr = teamChosen;
				} else if (typeof teamChosen === 'object') {
					if (teamChosen.maxPokemon && teamChosen.pokemon) {
					//generate random team
						let team = [];
						let pokes = teamChosen.pokemon.randomize();
						let k = 0;
						for (let i = 0; i < pokes.length; i++) {
							if (k++ >= teamChosen.maxPokemon) break;
							team.push(pokes[i]);
						}
						teamStr = this.packTeam(team);
					} else if (teamChosen.length) {
					//parse team
						teamStr = this.packTeam(teamChosen);
					} else {
						App.log("invalid team data type: " + JSON.stringify(teamChosen));
						return false;
					}
				} else {
					App.log("invalid team data type: " + JSON.stringify(teamChosen));
					return false;
				}
				return teamStr;
			} catch (e) {
				App.reportCrash(e.stack);
			}
		},

		hasTeam: function (format) {
			let formatId = Text.toId(format);
			if (this.teams[formatId]) return true;
			return false;
		},

		/* Pack Team function - from Pokemon-Showdown-Client */

		packTeam: function (team) {
			return Teams.packTeam(team);
		},
	};

	return module.exports;
};
