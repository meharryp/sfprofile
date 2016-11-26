// ==UserScript==
// @name         SF Checker
// @namespace    meharryp.xyz
// @version      1.0.
// @description  View a scriptfodder users profile information on their steam profile page.
// @downloadURL  https://raw.githubusercontent.com/meharryp/sfprofile/master/sfprofile.js
// @author       meharryp
// @match        http://steamcommunity.com/id/*
// @match        http://steamcommunity.com/profiles/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require      http://timeago.yarp.com/jquery.timeago.js
// @connect      scriptfodder.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
	'use strict';

	var bans = {};
	var data = {};

	$(".profile_leftcol").prepend(`
		<div class="profile_customization">
			<div class="profile_customization_header ellipsis">Scriptfodder Details</div>
			<div class="profile_customization_block">
				<div class="customtext_showcase">
					<div class="showcase_content_bg showcase_notes" id="sfholder"></div>
				</div>
			</div>
		</div>
	`);

	console.log();

	var steamid = "";

	$.ajax({
		url: window.location.href + "?xml=1",
	}).done(function(data){
		var $xml = $(data);
		steamid = $xml.find("steamID64").text();

		console.log(steamid);

		if (steamid === ""){ return; }

		// Get users bans
		GM_xmlhttpRequest({
			url: "https://scriptfodder.com/api/users/banned/" + steamid,
			method: "GET",
			onload: function(res){
				bans = JSON.parse(res.responseText).bans;

				console.log(bans);

				// Get user data
				GM_xmlhttpRequest({
					url: "https://scriptfodder.com/api/users/search/steam64/" + steamid,
					method: "GET",
					onload: function(res){
						data = JSON.parse(res.responseText);

						console.log(data);

						var html = "";

						console.log(bans);

                        html += `
						<b>Reputation: </b>${parseInt(data.user.scripts_rep) + parseInt(data.user.jobs_rep)}<br>
						<b>Registered </b>${$.timeago(new Date(parseInt(data.user.dateRegistered) * 1000))}<br>
						<b>Last online </b>${$.timeago(new Date(parseInt(data.user.lastAction) * 1000))}<br>
						<b>Country: </b>${data.user.country_code}<br>
						<b>Usergroup: </b>${(data.user.usergroup == "0" && "User" || data.user.usergroup == "1" && "Developer" || data.user.usergroup == "2" && "Moderator" || data.user.usergroup == "3" && "Admin")}<br>
						`;

						if (bans.length > 0){
							for (var i=0; i < bans.length; i++){
								var ban = bans[i];
								html += `
								<br>
								<b style="color:red">Banned ${$.timeago(new Date(parseInt(ban.ban_starttime) * 1000))}, ban ends in ${(parseInt(ban.ban_endtime) !== 0 && $.timeago(new Date(ban.ban_endtime)) || "Never")}.</b><ul>
								<li><i>Reason:</i> ${ban.ban_reason}<br></li>
								<li><i>Banned from:</i> `;

                                console.log(html);

								for (var i in ban.attributes){
									if (parseInt(ban.attributes[i])){
										switch (i){
											case "ban_create_appeal":
												html += "Creating ban appeals";
												break;
											case "ban_everything":
												html += "Everything";
												break;
											case "ban_forum_posting":
												html += "Posting on the forums";
												break;
											case "ban_job_applying":
												html += "Applying for jobs";
												break;
											case "ban_job_creation":
												html += "Creating new jobs";
												break;
											case "ban_script_creation":
												html += "Creating new scripts";
												break;
											case "ban_script_downloading":
												html += "Downloading scripts";
												break;
											case "ban_script_purchasing":
												html += "Purchasing scripts";
												break;
											case "ban_script_reviewing":
												html += "Reviewing scripts";
												break;
											case "ban_user_reviewing":
												html += "Reviewing users";
												break;
											default:
												html += "Something";
												break;
										}

										html += "</li></ul><br>";
									}
								}
							}

						}
						$("#sfholder").html(html);
					}
				});
			}
		});
	});
})();
