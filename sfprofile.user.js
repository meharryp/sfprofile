	// ==UserScript==
	// @name         gmodstore Checker
	// @namespace    meharryp.xyz
	// @version      1.1.3
	// @description  View a scriptfodder users profile information on their steam profile page.
	// @author       meharryp
	// @downloadURL  https://raw.githubusercontent.com/meharryp/sfprofile/master/sfprofile.user.js
	// @match        *://steamcommunity.com/id/*
	// @match        *://steamcommunity.com/profiles/*
	// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
	// @require      http://timeago.yarp.com/jquery.timeago.js
	// @connect      gmodstore.com
	// @grant        GM_xmlhttpRequest
	// ==/UserScript==

	(function() {
		'use strict';
	
		var apikey = ""; // ENTER YOUR API KEY HERE OR THE SCRIPT WONT WORK!!!
		var bans = {};
		var data = {};
		
		if (!apikey || apikey == ""){
			alert("SFProfile: You haven't set an API key! Edit the script file and add one to keep using this.");
		}

		$(".profile_leftcol").prepend(`
			<div class="profile_customization">
				<div class="profile_customization_header ellipsis">gmodstore Details</div>
				<div class="profile_customization_block">
					<div class="customtext_showcase">
						<div class="showcase_content_bg showcase_notes" id="sfholder"></div>
					</div>
				</div>
			</div>
		`);

		var steamid = g_rgProfileData.steamid;

			// Get users bans
		GM_xmlhttpRequest({
			url: "https://gmodstore.com/api/users/banned/" + steamid + "?api_key=" + apikey,
			method: "GET",
			onload: function(res){
			        console.log(res.responseText);
				bans = JSON.parse(res.responseText).bans;

				console.log(bans);

				// Get user data
				GM_xmlhttpRequest({
					url: "https://gmodstore.com/api/users/search/steam64/" + steamid + "?api_key=" + apikey,
					method: "GET",
					onload: function(res){
					data = JSON.parse(res.responseText);

	                        	var html = `
						<b>Reputation: </b>${parseInt(data.user.scripts_rep) + parseInt(data.user.jobs_rep)}<br>
						<b>Registered </b>${$.timeago(new Date(parseInt(data.user.dateRegistered) * 1000))}<br>
						<b>Last online </b>${$.timeago(new Date(parseInt(data.user.lastAction) * 1000))}<br>
						<b>Country: </b>${data.user.country_code}<br>
						<b>Usergroup: </b>${(data.user.usergroup == "0" && "User" || data.user.usergroup == "1" && "Developer" || data.user.usergroup == "2" && "Moderator" || data.user.usergroup == "3" && "Admin")}<br>`;

					if (bans.length > 0){
						for (var i=0; i < bans.length; i++){
							var ban = bans[i];
							html += `
								<br>
								<b style="color:red">Banned ${$.timeago(new Date(parseInt(ban.ban_starttime) * 1000))}, ban ends in ${(parseInt(ban.ban_endtime) !== 0 && $.timeago(new Date(ban.ban_endtime)) || "Never")}.</b><ul>
								<li><i>Reason:</i> ${ban.ban_reason}<br></li>
								</ul><i>Banned from:</i><ul>`;

							for (var i in ban.attributes){
								if (parseInt(ban.attributes[i])){
	                        		html += `<li>`;
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

										html += `</li>`;
									}
	                            }

	                       		html += `</ul>`;
							}
						}

	                       html += `<br><a href="https://gmodstore.com/users/view/${steamid}" target="_blank">gmodstore Profile</a>`;
							$("#sfholder").html(html);
						}
					});
				}
			});
	})();
