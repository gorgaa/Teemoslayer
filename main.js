/* 
All this code is copyright protected.
The code includes some snippets found on stackoverflow.com
Teemo slayer project
28/07/2014 - 

Work in Progress
Version : Beta

Spoiler alert!
*/

/*=====================================================
		GAME INITIALIZATION
=====================================================*/
$(document).ready(function(){

   load();
//   $("*").disableSelection();
   
   // Avoids unpleasant visual effects
   updateMusclesLevel ();
   computeTeemoResistance();
   
    if(allTimeTeemosSlain>= urfTeemosSlainRequirement){
		document.getElementById("urfChoice").style.display = "block";
    }


});

/*=====================================================
		INITIAL SETTINGS
=====================================================*/


var startingGold = 0; // change this for tests
var totalGoldGained = 0;
var gold = startingGold;
var roundGold = Math.floor(gold);
var goldPerSecond = 0;
var passiveChoice = 0; // until the player choses his passive, this is set to 0
var pastTeemosSlain = 0;
var allTimeTeemosSlain = 0;
var teemosSlain = 0;
var baseCursorHitPower = 1;
var cursorHitPower = 1;
var globalCooldownReduction = 0;
var maxGlobalCooldownReduction = 0.40;
var globalAttackSpeed = 0;
var globalCritChance = 0;
var globalCritModifier = 2;
var additiveGpSMultiplier = 0;
var multiplicativeGpSMultiplier = 1;
var percentageArmorPenetration = 0;
var percentageMagicPenetration = 0;
var armorPenetration = 0;
var magicPenetration = 0;
var urfTeemosSlainRequirement = 1000000000;

var musclesLevel = 1;
var globalAD = 0;
var globalAP = 0;

//seasons
var numberOfPoros = 0;
var seasonCount = 1;

// graphics
var mainButtonTeemoPortrait = "files/teemoPortraits/teemo_face.jpg"

/*==============================
	TAB SWITCHING & MINIMIZING
==============================*/

function openTab(input){
	var tabsId = [ "champions", "itemShop", "stats", "unlock", "options", "about"];
	
	for(i=0; i<=5; i++){
		document.getElementById(tabsId[i]).style.display = "none";
	}
	document.getElementById(tabsId[input]).style.display = "inline-block";
}


//minimize & maximize functions
$(document).ready(function(){
  $("#skinsMin").click(function(){
    var div=$("#teemoSkinsList");
    div.slideUp();
	$("#skinsMin").toggle();
	$("#skinsMax").toggle();
  });
});

$(document).ready(function(){
  $("#skinsMax").click(function(){
    var div=$("#teemoSkinsList");
    div.slideDown();
	$("#skinsMin").toggle();
	$("#skinsMax").toggle();
  });
});


/*=====================================================
		CONTROLS
=====================================================*/

$(document).ready(function(){
  $(document).keypress(function(e){
	var code = e.which;
    console.log(code)
	if(code == 49) { // 1
			useItem(0);
		}
	if(code == 50) { // 2
			useItem(1);
		}
	if(code == 51) { // 3
			useItem(2);
		}
	if(code == 52) { // 4
			useItem(3);
		}
	if(code == 53) { // 5
			useItem(4);
		}
	if(code == 54) { // 6
			useItem(5);
		}
      
    if((code == 113) || (code == 81)){ // Q or q
            castChampionSpell(0)
    }
      
    if((code == 119) || (code == 87)){ // W or w
            castChampionSpell(1)
    }
      
    if((code == 101) || (code == 69)){ // E or e
            castChampionSpell(2)
    }
      
    if((code == 114) || (code == 82)){ // R or r
            castChampionSpell(3)
    }
      
	});
});


/*=====================================================
		HELP FUNCTIONS
=====================================================*/



// Like this it should keep 2 significative digits
function prettify(number){
    return  Math.round(number * 100)/100;
}

function max3digits(number){
	return  Math.round(number * 1000)/1000;
}


// After the player choses the passive, the "champion passive" pages disappear to show the "hire champions" page
function swapDivsPassivesChampions() {

	document.getElementById("chooseYourPassive").style.display = 'none';
	document.getElementById("champions").style.display = 'inline-block';
	document.getElementById("champions").style.position = 'static';
	
};

function swapDivsChampionsPassives() {
	document.getElementById("chooseYourPassive").style.display = 'inline-block';
	document.getElementById("champions").style.display = 'none';
};

// Removes the first instance of the sold item from the itemBuild, without leaving any holes in the array.
function deleteSoldItem(item){
	i = 0;
	
	while(itemBuild[i].name !== item.name){
		i = i+1;
	}
	
	itemBuild.splice(i , 1);
}

function addCommas(nStr) // makes numbers easy to read, thanks to commas
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

var bigNumbersStrings = [
	' million',
	'  billion',
	'  trillion',
	'  quadrillion',
	'  quintillion',
	'  sextillion',
	'  septillion',
	'  octillion',
	'  nonillion',
	'  decillion',
	'  undecillion',
	'  duodecillion'
];

var bigNumbers = [
	1000000,
	1000000000,
	1000000000000,
	1000000000000000,
	1000000000000000000,
	1000000000000000000000,
	1000000000000000000000000,
	1000000000000000000000000000,
	1000000000000000000000000000000,
	1000000000000000000000000000000000,
	1000000000000000000000000000000000000,
	1000000000000000000000000000000000000000,
];

function prettyBigNumber(x) {
	if ( x<1000000){
		return prettify(x);
	}
	
	else{
		for(i=0; i<=11; i++){
			if(x < (bigNumbers[i]*1000)){
				
				return max3digits(x/bigNumbers[i]).toString() + bigNumbersStrings[i];
			}
		}
	}
};

//disabling selection
(function($){
    $.fn.disableSelection = function() {
        return this
                 .attr('unselectable', 'on')
                 .css('user-select', 'none')
                 .on('selectstart', false);
				 
    };
})(jQuery);


// Math

function log10(val){
	return Math.log(val)/Math.LN10;
}

/*=====================================================
		NOTIFICATIONS V2 TEST
=====================================================*/

var notifications = []
var maxNumberOfNotifications = 15;

function notify(title, text, life, height, animationDuration){
    
    // build the notification
    var tempNotification = {
        title: title,
        text: text,
        life: life,
        height: height,
        animationDuration: animationDuration,
        
        id: "notification_" + (notifications.length + 1)
    }
    

    if(notifications.length<maxNumberOfNotifications){  // temp - if the notifications array is full, don't notify. Not too clean
        notifications.push(tempNotification)
    }
    
}


function tempDrawNotification(title, text, height, id, fromTopPosition){
        notification = document.createElement("div");
        titleElement = document.createElement("h4")
        bodyElement = document.createElement("p")
    
        titleText = document.createTextNode(title)
        titleText = document.createTextNode(title)
        bodyText = document.createTextNode(text)
    
        titleElement.appendChild(titleText);
        bodyElement.appendChild(bodyText);
        
        notification.setAttribute("id", id);
        notification.setAttribute("class", "notificationsV2")
        
        notification.setAttribute("style", "top:" + fromTopPosition + "px; height:" + height + "px")
        
        document.body.appendChild(notification); 
        notification.appendChild(titleElement)
        notification.appendChild(bodyElement)
}


function processNotificationsArray(){
    
    // tune
    var timeToSubstractToLife = 50; // 50ms
    var heightFromTop = 63;
    
    // loop to remove all lingering notifications that should not be there ?!?
    for (var z=0; z<maxNumberOfNotifications; z++){
        if(notifications[z]===undefined && document.getElementById("notification_" + z)!==null){ // lingering notification - just to be safe
            element = document.getElementById("notification_" + z)
            element.parentNode.removeChild(element)
        }
    }
    
    
    
    // draw all the notifications in order, setting the y position from the top by adding all the heights of previous notifications
    for (var j=0; j < notifications.length; j++){
        if (document.getElementById(notifications[j]["id"]) === null){
            tempDrawNotification(notifications[j]["title"],
                                 notifications[j]["text"],
                                 notifications[j]["height"],
                                 notifications[j]["id"],
                                 heightFromTop)
        }
        heightFromTop = heightFromTop + notifications[j]["height"] + 6
    }
    
    // for loop, decrease life duration of all notifications by the amount necessary to make the loop work
    for (var i=0; i < notifications.length; i++){
        notifications[i]["life"] = notifications[i]["life"] - timeToSubstractToLife
        
        // in the same loop, if a notification life is <= 0, remove it from the DOM, and splice it from the notifications list
        if (notifications[i]["life"] <= 0) {
            // remove it from the DOM
            $("#fadingHitPower").finish().show().fadeOut(2000)
            //element = document.getElementById(notifications[i]["id"])
            //element.parentNode.removeChild(element)
            
            //splice it from the list
            notifications.splice(i, 1)
        }
    }
    

    // can be improved, by adding that notifications should fade-out in their last moments of life, instead of popping out.
    
}



/*=====================================================
		NOTIFICATIONS
=====================================================*/

/*
const notificationLifespawnDefault = 5000
const notificationFadeOutDurationDefault = 800
var numberOfActiveNotifications = 0


function drawNotification(notificationTitle, notificationText, isGameSavedNotification=false){
        notification = document.createElement("div");
        titleElement = document.createElement("h3")
        bodyElement = document.createElement("p")
    
        titleText = document.createTextNode(notificationTitle)
        bodyText = document.createTextNode(notificationText)
    
        titleElement.appendChild(titleText);
        bodyElement.appendChild(bodyText);
        
        notification.setAttribute("id", "notification_" + numberOfActiveNotifications);
        titleElement.setAttribute("id", "notificationTitle");
        bodyElement.setAttribute("id", "notificationText");
    
        
        document.body.appendChild(notification); 
        notification.appendChild(titleElement)
        notification.appendChild(bodyElement)
    
        if(isGameSavedNotification){ // smaller, notification
            notification.setAttribute("style", "height: 40px")
        }
        numberOfActiveNotifications = numberOfActiveNotifications + 1
}


function fadeOutNotification(animationDuration){
    $('#notification_' + numberOfActiveNotifications).fadeOut(animationDuration);
}


function removeNotification(delayBeforeDeletion){ 
    setTimeout(function(){
        $('#notification_' + numberOfActiveNotifications).remove();
    }, delayBeforeDeletion);
    numberOfActiveNotifications = numberOfActiveNotifications - 1

}

function fullNotificationProcess(notificationTitle, notificationText, notificationLifespawn=notificationLifespawnDefault, notificationFadeOutDuration=notificationFadeOutDurationDefault,
                                 isGameSavedNotification=false){

    if(numberOfActiveNotifications<=3){// max 4 displayed notifications at the same time
        drawNotification(notificationTitle, notificationText, isGameSavedNotification=isGameSavedNotification);

        setTimeout(function(){
                // delayBeforeDeletion is set equal to animation duration so that the element is removed only when the fade out animation is completed
                fadeOutNotification(notificationFadeOutDuration);  
                removeNotification(notificationFadeOutDuration);
        }, notificationLifespawn);
    }
    
}
*/

/*=====================================================
		CURSOR HIT GRAPHICS
=====================================================*/

//maxConcurrent

/*
function drawCursorHitPower(hitPower, event){
    
    clickX = event.clientX
    clickY = event.clientY
    verticalOffset = 25
    horizontalOffset = 5
    
    randomVerticalOffset = (Math.random() - 0.5)*20
    randomHorizontalOffset = (Math.random() - 0.5)*20
    
    hitDrawing = document.createElement("p")
    hitDrawing.setAttribute("class", "hitDrawingClass")
    hitDrawing.innerHTML = clickX + " " + clickY
    
    hitDrawing.style.left = (clickX - horizontalOffset - randomHorizontalOffset) + "px";
    hitDrawing.style.top = (clickY - verticalOffset - randomVerticalOffset) + "px";
    
    document.body.appendChild(hitDrawing)
    
    setTimeout(function(){
        document.body.removeChild(hitDrawing)
    }, 1000);
    

}

*/

/*=====================================================
		UPDATES & INTERFACE FUNCTIONS
=====================================================*/


function updateChampionsInterface() {
	updateChampionInterface(ryze);
	updateChampionInterface(darius);
	updateChampionInterface(rumble);
	updateChampionInterface(riven);
	updateChampionInterface(syndra);
	updateChampionInterface(pantheon);
	updateChampionInterface(mordekaiser);
	updateChampionInterface(leeSin);
	updateChampionInterface(kassadin);
	updateChampionInterface(zed);
	updateChampionInterface(heimerdinger);
	updateChampionInterface(draven);
	updateChampionInterface(akali);
	updateChampionInterface(aurelionSol);
}

function updateItemsInterface() {
    
	updateItemInterface(doransBlade);
	updateItemInterface(doransRing);
	updateItemInterface(brutalizer);
	updateItemInterface(hauntingGuise);
	updateItemInterface(bloodthirster);
	updateItemInterface(rabadonsDeathcap);
	updateItemInterface(phantomDancer);
	updateItemInterface(nashorsTooth);
	updateItemInterface(trinityForce);
	updateItemInterface(ghostblade);
	updateItemInterface(infinityEdge);
	updateItemInterface(lightbringer);
	updateItemInterface(lastWhisper);
	updateItemInterface(voidStaff);
	updateItemInterface(deathfireGrasp);
	
	
	// RIP items
    updateRipItemInterface(bonetoothNecklace);
	updateRipItemInterface(heartOfGold);
	updateRipItemInterface(philosophersStone);
    
    // Gold gained from selling all items
//    updateGoldGainedFromSellingAllItems();
	
};

function updateSkinsInterface() {
	updateSkinDataInterface (reconTeemo);
	updateSkinDataInterface (cottontailTeemo);
	updateSkinDataInterface (astronautTeemo);
	updateSkinDataInterface (superTeemo);
	updateSkinDataInterface (badgerTeemo);
	updateSkinDataInterface (pandaTeemo);
	updateSkinDataInterface (omegaSquadTeemo);
};

function updateChampionsUpgradesInterface() {
	updateChampionUpgradeInterface(ryzeUpgrade18);
	updateChampionUpgradeInterface(dariusUpgrade18);
	updateChampionUpgradeInterface(rumbleUpgrade18);
	updateChampionUpgradeInterface(rivenUpgrade18);
	updateChampionUpgradeInterface(syndraUpgrade18);
	updateChampionUpgradeInterface(pantheonUpgrade18);
	updateChampionUpgradeInterface(mordekaiserUpgrade18);
	updateChampionUpgradeInterface(leeSinUpgrade18);
	updateChampionUpgradeInterface(kassadinUpgrade18);
	updateChampionUpgradeInterface(zedUpgrade18);
	updateChampionUpgradeInterface(heimerdingerUpgrade18);
	updateChampionUpgradeInterface(dravenUpgrade18);
	updateChampionUpgradeInterface(akaliUpgrade18);
	updateChampionUpgradeInterface(aurelionSolUpgrade18);
}


function updatePlayerStatsInterface(){
	document.getElementById("displayedAD").innerHTML = addCommas(Math.floor(globalAD));  //short stats
	document.getElementById("displayedAD2").innerHTML = addCommas(Math.floor(globalAD)); //Full stats
    document.getElementById("displayedAP").innerHTML = addCommas(Math.floor(globalAP));  //short stats
	document.getElementById("displayedAP2").innerHTML = addCommas(Math.floor(globalAP)); //Full stats
	document.getElementById("displayedCooldownReduction").innerHTML = Math.round(globalCooldownReduction * 100) + "%";  //short stats
	document.getElementById("displayedCooldownReduction2").innerHTML = Math.round(globalCooldownReduction * 100) + "%"; //Full stats
	document.getElementById("displayedCritChance").innerHTML = Math.round(globalCritChance * 100) + "%";  //short stats
	document.getElementById("displayedCritChance2").innerHTML = Math.round(globalCritChance * 100) + "%"; //Full stats
	document.getElementById("displayedAttackSpeed").innerHTML = Math.round(globalAttackSpeed * 100) + "%";  //short stats
	document.getElementById("displayedAttackSpeed2").innerHTML = Math.round(globalAttackSpeed * 100) + "%"; //Full stats
	document.getElementById("displayedArmorPenetration").innerHTML = percentageArmorPenetration * 100 + '% / ' + Math.round(armorPenetration);
	document.getElementById("displayedMagicPenetration").innerHTML = percentageMagicPenetration * 100 + '% / ' + Math.round(magicPenetration);
	document.getElementById("displayedCriticalStrikeModifier").innerHTML = Math.round(globalCritModifier * 100) + "%";
	document.getElementById("displayedNumberOfPoros").innerHTML = addCommas(numberOfPoros);
	document.getElementById("displayedSeasonCount").innerHTML = seasonCount;
	
	
    // CHAMPION SPELLS SCALING STATS
    // ryzeOverload
    document.getElementById("ryzeOverloadDisplayedPower").innerHTML =  addCommas(prettyBigNumber(2 + (1.5*globalAP) + (0.002*globalAP*goldPerSecond))); //overloadPower
    document.getElementById("ryzeOverloadFlatAPScaling").innerHTML =  addCommas(prettyBigNumber((1.5*globalAP))); //overloadPower
    document.getElementById("ryzeOverloadAPGpSScaling").innerHTML =  addCommas(prettyBigNumber((0.002*globalAP*goldPerSecond))); //overloadPower
    document.getElementById("ryzeOverloadEffectiveCooldown").innerHTML =  addCommas(prettyBigNumber(championSpellEffectiveCooldown(ryzeOverload))); //overloadPower

    // rivenBrokenWings
    document.getElementById("rivenBrokenWingsLastStrikeMultiplier").innerHTML =  addCommas(prettyBigNumber(100*(2 + riven.level*0.05))); 
    document.getElementById("rivenBrokenWingsDisplayedPower").innerHTML =  addCommas(prettyBigNumber((15 + (2*globalAD) + (0.003*globalAD*goldPerSecond))));
    document.getElementById("rivenBrokenWingsFlatADScaling").innerHTML =  addCommas(prettyBigNumber((2*globalAD))); 
    document.getElementById("rivenBrokenWingsADGpSScaling").innerHTML =  addCommas(prettyBigNumber((0.003*globalAD*goldPerSecond)));           
    document.getElementById("rivenBrokenWingsEffectiveCooldown").innerHTML = addCommas(prettyBigNumber(championSpellEffectiveCooldown(rivenBrokenWings)));            


    // mordekaiserChildrenOfTheGrave
    document.getElementById("mordekaiserChildrenOfTheGraveDisplayedPower").innerHTML =  addCommas(prettyBigNumber(4000 + (3*globalAP) + (0.008*globalAP*goldPerSecond))); 
    document.getElementById("mordekaiserChildrenOfTheGraveFlatAPScaling").innerHTML =  addCommas(prettyBigNumber((3*globalAP)));
    document.getElementById("mordekaiserChildrenOfTheGraveAPGpSScaling").innerHTML =  addCommas(prettyBigNumber((0.008*globalAP))); 
    document.getElementById("mordekaiserChildrenOfTheGraveBonusAP").innerHTML =  addCommas(prettyBigNumber(100 + 0.2*globalAP));           
    document.getElementById("mordekaiserChildrenOfTheGraveCooldown").innerHTML = addCommas(prettyBigNumber(championSpellEffectiveCooldown(mordekaiserChildrenOfTheGrave))); 
    
    
//                Power : <span style="color:red; font-weight: bold;" id="zedDeathMarkDisplayedPower"></span> (3 million + <span id="zedDeathMarkFlatADScaling"></span> (1% AD per GpS)) + <span id="zedDeathMarkDamageStorage"></span>% (80% + 10% per Zed level) of the damage dealt during its duration (before resistances).<br/>
    
    // zedDeathMark
    document.getElementById("zedDeathMarkDamageStorage").innerHTML =  addCommas(prettyBigNumber(100*(0.8 + 0.1*zed.level))); 
    document.getElementById("zedDeathMarkDisplayedPower").innerHTML =  addCommas(prettyBigNumber((3000000 + (0.01*globalAD*goldPerSecond))));
    document.getElementById("zedDeathMarkADGpSScaling").innerHTML =  addCommas(prettyBigNumber((0.01*globalAD*goldPerSecond)));           
    document.getElementById("zedDeathMarkEffectiveCooldown").innerHTML = addCommas(prettyBigNumber(championSpellEffectiveCooldown(zedDeathMark)));      
    
    
	//GAME STATS
	document.getElementById("allTimeTeemosSlain").innerHTML = addCommas(prettyBigNumber(allTimeTeemosSlain));
	
	//Hidden unless lightbringer is owned
	document.getElementById("displayedTeemoArmor").innerHTML = teemoArmor;
	document.getElementById("displayedTeemoMagicResistance").innerHTML = teemoMagicResistance;
	if(lightbringer.owned()){
		document.getElementById("displayedTeemoArmor").innerHTML = teemoArmor;
		document.getElementById("displayedTeemoMagicResistance").innerHTML = teemoMagicResistance;
	}
	else{
		document.getElementById("displayedTeemoArmor").innerHTML = '?';
		document.getElementById("displayedTeemoMagicResistance").innerHTML = '?';
	}
	
	
}


function updateTotalItemsOwned() {
	totalItemsOwned = doransBlade.number + doransRing.number + brutalizer.number + hauntingGuise.number + bloodthirster.number + rabadonsDeathcap.number + phantomDancer.number + nashorsTooth.number + trinityForce.number + ghostblade.number + infinityEdge.number + lightbringer.number + lastWhisper.number + voidStaff.number + deathfireGrasp.number;
};


function updateDisplayedInventory() {
	
	
	for(i=0; i<maxItemsNumber; i++) {	
		if(itemBuild[i]){ // if there's actually an item, not an empty slot
            
			document.getElementById("itemSlot" + i).src = itemBuild[i].iconUrl;
            
   
            
            // visually display trinity force cooldown in Hit Him page
            
            if(itemBuild[i].hasSpell === 1){
                if(itemSpellIsOnCooldown(itemBuild[i])){
                    document.getElementById("itemSlot" + i).src = itemBuild[i].iconUrl.replace(".jpg", "") + "_on_cd.jpg";
                }
            } 
            
            
        }
		
        
        
        
        
        
        
		else{
			document.getElementById("itemSlot" + i).src = "files/items/empty_slot.jpg";
            document.getElementById("itemSlot" + i).style.border = "none"
			document.getElementById("itemSlot" + i).style.padding = "0px"
            

		}
	}
};



function updateDisplayedSpellsInventory() {
	
	
	for(i=0; i<maxSpellsEquippedNumber; i++) {	
		if(spellsBuild[i]){ // if there's actually a spell, not an empty block
            
			document.getElementById("spellSlot" + i).src = spellsBuild[i].iconUrl;
            document.getElementById("spellSlot" + i).style = "filter: grayscale(0%);";
            document.getElementById("spellSlotCooldownIndicator" + i).innerHTML = '';

            
            // visually display trinity force cooldown in Hit Him page
            
            if(spellsBuild[i].currentCooldown > 0){
//                document.getElementById("spellSlot" + i).src = "files/spells/empty_slot.jpg";   
                document.getElementById("spellSlot" + i).style = "filter: grayscale(100%);";
                
                document.getElementById("spellSlotCooldownIndicator" + i).style.display = "";
                document.getElementById("spellSlotCooldownIndicator" + i).innerHTML = Math.round(spellsBuild[i].currentCooldown);
//                document.getElementById("mainSpells").style.backgroundColor = "red;"

            } 
            
            
        }
		
        
    
        
        
		else{
			document.getElementById("spellSlot" + i).src = "files/spells/empty_slot.jpg";
            document.getElementById("spellSlotCooldownIndicator" + i).innerHTML = '';
//            document.getElementById("itemSlot" + i).style.border = "none"
//			document.getElementById("itemSlot" + i).style.padding = "0px"
//            

		}
	}
};


// This is called every time a number on the browser changes, and updates what the player sees						
function updateInterface(){
	computeGoldPerSecond();
	computeCursorHitPower();
	updateChampionsInterface();
	updateItemsInterface();
	updateSkinsInterface();
	updateChampionsUpgradesInterface();
	
	updatePlayerStatsInterface();
	//Interface
	
	document.getElementById("displayedGoldPerSecond").innerHTML = addCommas(prettyBigNumber(goldPerSecond));
	//document.getElementById("miniGpS1").innerHTML = addCommas(prettyBigNumber(goldPerSecond));
	
	
	
	document.getElementById("displayedTeemosSlain").innerHTML = addCommas(prettyBigNumber(teemosSlain));
	document.getElementById("displayedGold").innerHTML = addCommas(prettyBigNumber(roundGold));
	
	
	
};

/*=====================================================
		TEEMO RESISTANCES
=====================================================*/
var teemoArmor = 0;
var teemoMagicResistance = 0;

function computeTeemoResistance(){
	if(teemosSlain<=50){ // because math. And seeing cursor hit power < 1 is not cool
		temp = 0;
	}		
	else{
		var temp = Math.round( 11 * log10(teemosSlain));
	}
	
	if(temp>=200) temp = 200; // Resistances cap at 200
	
	teemoArmor = temp;
	teemoMagicResistance = temp;
	
};


/*=====================================================
		TEEMO BUTTON HITTING
			CRITS & PARTICLES
=====================================================*/

// You hit Teemo
function hitTeemo() {
    var currentHitPower = 0;
	var x = Math.random();
	if( x < globalCritChance) { // Crit

		if(trinityForce.owned() && spellBladeOnCooldown() === 0){
			currentHitPower = cursorHitPower + goldPerSecond * 30;
			setSpellBladeCooldown();
            updateDisplayedInventory();
		}

		else{
		      currentHitPower = cursorHitPower;
            
		}
		currentHitPower = currentHitPower * globalCritModifier; //apply crit, modify this if you buy I.E.
		gold = gold + currentHitPower;
		totalGoldGained = totalGoldGained + currentHitPower;
	
		document.getElementById("fadingHitPower").innerHTML = '+ ' + addCommas(prettyBigNumber(currentHitPower)) + '!';
		document.getElementById("fadingHitPower").style.color = "green";
		$("#fadingHitPower").finish().show().fadeOut(2000);
	
		updateInterface();
	}
	

	else 	{ // No crit (Same code as above divided by 2 :D)

		if(trinityForce.owned() && spellBladeOnCooldown() === 0){
			currentHitPower = cursorHitPower + goldPerSecond * 30;
			setSpellBladeCooldown();
            updateDisplayedInventory();
		}

		else{
		      currentHitPower = cursorHitPower;
		
		}
		gold = gold + currentHitPower;
		totalGoldGained = totalGoldGained + currentHitPower;
		
		document.getElementById("fadingHitPower").innerHTML = '+ ' + addCommas(prettyBigNumber(currentHitPower));
		document.getElementById("fadingHitPower").style.color = "black";
		$("#fadingHitPower").finish().show().fadeOut(2000);

	
		updateInterface();
	}
	
    
    
	
};


/*=====================================================
		HIT TEEMO WITH SPELLS
=====================================================*/


function hitTeemoWithSpell(championSpell, spellStrength, teemoResistanceToSpell, spellDamageType) {
    // spellDamageType can be AD, AP or TR
 	if(spellDamageType=='AP'){
        effectiveMagicResistance = (teemoResistanceToSpell * ( 1 - percentageMagicPenetration)) - magicPenetration;
        effectiveSpellStrength = spellStrength * (100/(100 + effectiveMagicResistance));
        document.getElementById("fadingSpellHitPower").style.color = "blue";
        
    }
    
    else if(spellDamageType=='AD'){
        effectiveArmor = (teemoResistanceToSpell * ( 1 - percentageArmorPenetration)) - armorPenetration;
        effectiveSpellStrength = spellStrength * (100/(100 + effectiveArmor));
        document.getElementById("fadingSpellHitPower").style.color = "red";
    }
    
    else{ // True damage
        effectiveSpellStrength = spellStrength
        document.getElementById("fadingSpellHitPower").style.color = "purple";
    }
    
    gold = gold + spellStrength
    totalGoldGained = totalGoldGained + spellStrength
    
    document.getElementById("fadingSpellHitPower").innerHTML = '+ ' + addCommas(prettyBigNumber(effectiveSpellStrength));

    
    $("#fadingSpellHitPower").finish().show().fadeOut(2000);
	updateInterface();
};


/*=====================================================
		MUSCLES
=====================================================*/

var musclesLevelChampionsList = [
	' Annie',
	' Gnar',
	' Ezreal',
	' Xin Zhao',
	' Braum'
]

var musclesLevelUrlList = [
	'annie.jpg',
	'gnar.jpg',
	'ezreal.jpg',
	'xin_zhao.jpg',
	'braum.jpg'
]

function updateMusclesLevel () {
	
	musclesLevel = 1;
	musclesIndex = 0;
	
	if(teemosSlain > 25){
		musclesLevel = 1.11;
		musclesIndex = 1;
	}
	
	if(teemosSlain > 250){
		musclesLevel = 1.22;
		musclesIndex = 2;
	}
	
	if(teemosSlain > 50000) {
		musclesLevel = 1.33;
		musclesIndex = 3;
	}
	
	if(teemosSlain > 10000000) {
		musclesLevel = 1.5;
		musclesIndex = 4;
	}
	
	//update visuals
	document.getElementById("musclesLevelIcon").src = "files/muscles/" + musclesLevelUrlList[musclesIndex];
	document.getElementById("musclesLevel").innerHTML = musclesLevelChampionsList[musclesIndex];
    document.getElementById("displayedMusclesMultiplier").innerHTML = musclesLevel*100;
	
};



/*=====================================================
		ECONOMICS
=====================================================*/


var goldGainLoopDivision = 100


function testGainGold(gps){
    
    if(document.hasFocus()){
        amount = gps/goldGainLoopDivision
    }
    
    else amount = gps
    
    
    gold = gold + amount;
    totalGoldGained = totalGoldGained + amount;
    updateInterface();
}


// Basic earning function
function gainGold(x) {
	gold = gold + x;
	totalGoldGained = totalGoldGained + x;
	updateInterface();
}


function computeGoldPerSecond(){
	computeAdditiveGpSMultiplier();
	computeMultiplicativeGpSMultiplier();
    
		goldPerSecond = 2*doransRing.number + ryze.goldPerSecond() * ryze.owned() * (1 + 0.5*doomIsActive) + darius.goldPerSecond() * darius.owned() + rumble.goldPerSecond() * rumble.owned() * (1 + 0.5*doomIsActive) + riven.goldPerSecond() * riven.owned() + syndra.goldPerSecond() * syndra.owned() * (1 + 0.5*doomIsActive) + pantheon.goldPerSecond() * pantheon.owned() + mordekaiser.goldPerSecond() * mordekaiser.owned() * (1 + 0.5*doomIsActive) + leeSin.goldPerSecond() * leeSin.owned() + kassadin.goldPerSecond() * kassadin.owned() * (1 + 0.5*doomIsActive) + zed.goldPerSecond() * zed.owned() + heimerdinger.goldPerSecond() * heimerdinger.owned() * (1 + 0.5*doomIsActive) + draven.goldPerSecond() * draven.owned() + akali.goldPerSecond() * akali.owned() * (1 + 0.5*doomIsActive) + aurelionSol.goldPerSecond() * aurelionSol.owned() * (1 + 0.5*doomIsActive); // Other passives or passive not chosen yet
	
	
	goldPerSecond = goldPerSecond * (1 + (additiveGpSMultiplier)) * (multiplicativeGpSMultiplier); 
	
	
	
};


/*
function computeAdditiveGpSMultiplier() {
	additiveGpSMultiplier = reconTeemo.owned*reconTeemo.power + cottontailTeemo.owned*cottontailTeemo.power + astronautTeemo.owned*astronautTeemo.power + superTeemo.owned*superTeemo.power +badgerTeemo.owned*badgerTeemo.power + pandaTeemo.owned*pandaTeemo.power + omegaSquadTeemo.owned*omegaSquadTeemo.power + 0.025*numberOfPoros;
};

function computeMultiplicativeGpSMultiplier() {
	if(passiveChoice === 1){ // gangplank
		multiplicativeGpSMultiplier = 1 + 0.10 + heartOfGold.gpsBonus*heartOfGold.number + philosophersStone.gpsBonus*philosophersStone.number + (bonetoothNecklace.gpsBonus * bonetoothNecklace.number * numofUnlockedAchievements/numofAllAchievements);
	}
	
	else {
		multiplicativeGpSMultiplier = 1 + heartOfGold.gpsBonus*heartOfGold.number + philosophersStone.gpsBonus*philosophersStone.number + (bonetoothNecklace.gpsBonus * bonetoothNecklace.number * numofUnlockedAchievements/numofAllAchievements);
	}
};


teemo skins
gangplank
hog --
phil --
bone
poros


*/

var porosPower = 0.01;
var wateryRoadPower = 0.01;

function computeAdditiveGpSMultiplier() {
    additiveGpSMultiplier = heartOfGold.gpsBonus*heartOfGold.number + philosophersStone.gpsBonus*philosophersStone.number;
};

function computeMultiplicativeGpSMultiplier() {
	if(passiveChoice === 1){ // gangplank
        multiplicativeGpSMultiplier = 1.1 * (1 + porosPower*numberOfPoros) * (1 + bonetoothNecklace.gpsBonus * bonetoothNecklace.number * numofUnlockedAchievements/numofAllAchievements) * (1 + reconTeemo.owned*reconTeemo.power) * (1 + cottontailTeemo.owned*cottontailTeemo.power) * (1 + astronautTeemo.owned*astronautTeemo.power) * (1 + superTeemo.owned*superTeemo.power) * (1 + badgerTeemo.owned*badgerTeemo.power) * (1 + pandaTeemo.owned*pandaTeemo.power) * (1 + omegaSquadTeemo.owned*omegaSquadTeemo.power);
            
	}
	
	else {
        multiplicativeGpSMultiplier = (1 + porosPower*numberOfPoros) * (1 + bonetoothNecklace.gpsBonus * bonetoothNecklace.number * numofUnlockedAchievements/numofAllAchievements) * (1 + reconTeemo.owned*reconTeemo.power) * (1 + cottontailTeemo.owned*cottontailTeemo.power) * (1 + astronautTeemo.owned*astronautTeemo.power) * (1 + superTeemo.owned*superTeemo.power) * (1 + badgerTeemo.owned*badgerTeemo.power) * (1 + pandaTeemo.owned*pandaTeemo.power) * (1 + omegaSquadTeemo.owned*omegaSquadTeemo.power);
	}
};





/*=====================================================
		PLAYER STATS
=====================================================*/

var adChampionsLevelToADConversionRate = 1
var apChampionsLevelToAPConversionRate = 1

var kayleADtoAPConversionRate = 0.15
var kayleAPtoADConversionRate = 0.15

function computeCursorHitPower() {
	var effectiveArmor = teemoArmor;
    var tempCursorHitPower = 1;
    
	computeGoldPerSecond();
	if(passiveChoice === 3){ // Tryndamere
	tempCursorHitPower = prettify(1.20*(baseCursorHitPower + 1*doransBlade.number + (2.718*(globalAD)/100)*(goldPerSecond/100)));
	}
	
	else{
	tempCursorHitPower = prettify(baseCursorHitPower + 1*doransBlade.number + (2.718*(globalAD)/100)*(goldPerSecond/100));
	}
	
	tempCursorHitPower = tempCursorHitPower * musclesLevel; // apply muscles!
	
	if(frenzyIsActive){
		tempCursorHitPower = 2*tempCursorHitPower;
	}



    effectiveArmor = (effectiveArmor * ( 1 - percentageArmorPenetration)) - armorPenetration; //GpS reduction formula
	if(effectiveArmor<=0) effectiveArmor =0; //can't go below 0 for now		
    tempCursorHitPower = tempCursorHitPower * (100/(100 + effectiveArmor));
    
    cursorHitPower = tempCursorHitPower;
}

function computePlayerStats() {
	computeGlobalAD();
	computeGlobalAP();
	computeArmorPenetration();
	computeMagicPenetration();
	computePercentageArmorPenetration();
	computePercentageMagicPenetration();
	computeGlobalCooldownReduction();
	computeGlobalCriticalChance();
	computeGlobalCritModifier();
	computeGlobalAttackSpeed();

}

var cumulativeAdChampionsLevel = 0;
var	cumulativeApChampionsLevel = 0;

function computeCumulativeAdChampionsLevel(){
	cumulativeAdChampionsLevel = darius.level*(1+dariusUpgrade18.owned) + riven.level*(1+rivenUpgrade18.owned) + pantheon.level*(1+pantheonUpgrade18.owned) + leeSin.level*(1+leeSinUpgrade18.owned) + zed.level*(1+zedUpgrade18.owned) + draven.level*(1+dravenUpgrade18.owned) + 0.5*akali.level*(1+akaliUpgrade18.owned);
}

function computeCumulativeApChampionsLevel(){
	cumulativeApChampionsLevel = ryze.level*(1+ryzeUpgrade18.owned) + rumble.level*(1+rumbleUpgrade18.owned) + syndra.level*(1+syndraUpgrade18.owned) + mordekaiser.level*(1+mordekaiserUpgrade18.owned) + kassadin.level*(1+kassadinUpgrade18.owned) + heimerdinger.level*(1+heimerdingerUpgrade18.owned) + 0.5*akali.level*(1+akaliUpgrade18.owned) + aurelionSol.level*(1+aurelionSolUpgrade18.owned);
}

function computeGlobalAD(){
	computeCumulativeAdChampionsLevel();
	computeCumulativeApChampionsLevel();
	if(passiveChoice===2){ //Kayle
		apTemp = (apChampionsLevelToAPConversionRate * cumulativeApChampionsLevel + 30*hauntingGuise.number +150*rabadonsDeathcap.number + 50*nashorsTooth.number + 30*trinityForce.number + 80*voidStaff.number + 120*deathfireGrasp.number)*(1 + 0.15*rabadonsDeathcap.owned()) + childrenOfTheGraveBonusAP();
		globalAD = kayleAPtoADConversionRate * apTemp + (0.5*cumulativeAdChampionsLevel + 20*brutalizer.number + 40*lightbringer.number + 50*lastWhisper.number + 80*bloodthirster.number + 30*trinityForce.number + 40*ghostblade.number + 80*infinityEdge.number)*(1 + 0.10*bloodthirster.owned()) + childrenOfTheGraveBonusAD();
	}

	else{
	globalAD = (adChampionsLevelToADConversionRate * cumulativeAdChampionsLevel + 20*brutalizer.number + 40*lightbringer.number + 50*lastWhisper.number + 80*bloodthirster.number + 30*trinityForce.number + 40*ghostblade.number + 80*infinityEdge.number)*(1 + 0.10*bloodthirster.owned()) + childrenOfTheGraveBonusAD();
	}
};

function computeGlobalAP(){
	computeCumulativeAdChampionsLevel();
	computeCumulativeApChampionsLevel();
	if(passiveChoice===2){ //Kayle
		adTemp = (adChampionsLevelToADConversionRate * cumulativeAdChampionsLevel + 20*brutalizer.number + 40*lightbringer.number + 50*lastWhisper.number + 80*bloodthirster.number + 30*trinityForce.number + 40*ghostblade.number + 80*infinityEdge.number)*(1 + 0.10*bloodthirster.owned()) + childrenOfTheGraveBonusAD();
		globalAP = kayleADtoAPConversionRate * adTemp + (1*cumulativeApChampionsLevel + 30*hauntingGuise.number + 150*rabadonsDeathcap.number + 50*nashorsTooth.number + 30*trinityForce.number + 80*voidStaff.number + 120*deathfireGrasp.number)*(1 + 0.15*rabadonsDeathcap.owned()) + childrenOfTheGraveBonusAP();
	}
	
	else {
	globalAP = (apChampionsLevelToAPConversionRate * cumulativeApChampionsLevel + 30*hauntingGuise.number + 150*rabadonsDeathcap.number + 50*nashorsTooth.number + 30*trinityForce.number + 80*voidStaff.number + 120*deathfireGrasp.number)*(1 + 0.15*rabadonsDeathcap.owned()) + childrenOfTheGraveBonusAP();
	}
};

function computeArmorPenetration(){
	armorPenetration = 10*brutalizer.owned();
};

function computePercentageArmorPenetration(){
	percentageArmorPenetration = 0 + 0.60*lastWhisper.owned();
};

function computePercentageMagicPenetration(){
	percentageMagicPenetration = 0 + 0.60*voidStaff.owned();
};

function computeMagicPenetration(){
	magicPenetration = 15*hauntingGuise.owned();
};

function computeGlobalCooldownReduction () {
	var temp = 0.10*brutalizer.owned() + 0.10*ghostblade.number + 0.10*deathfireGrasp.number + 0.2*nashorsTooth.owned() + 0.2*trinityForce.owned();
	if(temp <= maxGlobalCooldownReduction){ //cdr cap
		globalCooldownReduction = temp;
	}
	
	else{
		globalCooldownReduction = maxGlobalCooldownReduction;
	}
    
    if(passiveChoice===4){ // NEW URF PASSIVE
        globalCooldownReduction = 0.8;
    }
    
    updatePlayerStatsInterface();
};

function computeGlobalCriticalChance () {
	var temp = 0.10*trinityForce.number + 0.2*infinityEdge.owned() + 0.15*ghostblade.number + 0.10*lightbringer.number + 0.30*phantomDancer.number;
	if(temp < 1){                             // crit chance cap (can't be increased :D)
		globalCritChance = temp;
	}
	
	else
		globalCritChance = 1;
}

function computeGlobalAttackSpeed () {
    globalAttackSpeed = (phantomDancer.number * 0.55) + (lightbringer.number * 0.4) + (nashorsTooth.number * 0.55)
}


function computeGlobalCritModifier () {
	globalCritModifier = 2 + 0.5*infinityEdge.owned();
};

/*=====================================================
		TEEMO SKINS
=====================================================*/

// new object: teemo skin
function TeemoSkin(name, cost, unlockRequirement, power, portraitLocation) {
	this.name = name;
	this.cost = cost;
	this.power = power;
	this.unlockRequirement = unlockRequirement;
	this.owned = 0;
    this.portraitLocation = portraitLocation;
}



function checkTeemoSkinsUnlocking() {
    
    // Recon Teemo
	if(teemosSlain>=reconTeemo.unlockRequirement){
        
        if(document.getElementById("reconTeemo").style.display === "none"){
            notify("Teemo Skin Unlocked!", "You have unlocked 'Recon Teemo'!", 5000, 120, 1000);   
        }
        
		document.getElementById("reconTeemo").style.display = "initial";
		document.getElementById("noSkins").style.display = "none"; // it's the first skin
	}
	else{
		document.getElementById("reconTeemo").style.display = 'none';
	}
    
    
    // Cottontail Teemo
	if(teemosSlain>=cottontailTeemo.unlockRequirement){
        
        if(document.getElementById("cottontailTeemo").style.display === "none"){
            notify("Teemo Skin Unlocked!", "You have unlocked 'Cottontail Teemo'!", 5000, 120, 1000)       
        }
        
		document.getElementById("cottontailTeemo").style.display = "initial";
	}
	else{
		document.getElementById("cottontailTeemo").style.display = 'none';
	}

	
    // Astronaut Teemo
	if(teemosSlain>=astronautTeemo.unlockRequirement){
        
        if(document.getElementById("astronautTeemo").style.display === "none"){
            notify("Teemo Skin Unlocked!", "You have unlocked 'Astronaut Teemo'!", 5000, 120, 1000)       
        }
        
		document.getElementById("astronautTeemo").style.display = "initial";
	}
	else{
		document.getElementById("astronautTeemo").style.display = 'none';
	}
    
    
    // Super Teemo
	if(teemosSlain>=superTeemo.unlockRequirement){
        
        if(document.getElementById("superTeemo").style.display === "none"){
            notify("Teemo Skin Unlocked!", "You have unlocked 'Super Teemo'!", 5000, 120, 1000)        
        }
        
		document.getElementById("superTeemo").style.display = "initial";
	}
	else{
		document.getElementById("superTeemo").style.display = 'none';
	}

	
    // Badger Teemo
    if(teemosSlain>=badgerTeemo.unlockRequirement){
        
        if(document.getElementById("badgerTeemo").style.display === "none"){
            notify("Teemo Skin Unlocked!", "You have unlocked 'Badger Teemo'!", 5000, 120, 1000)        
        }
        
		document.getElementById("badgerTeemo").style.display = "initial";
	}
	else{
		document.getElementById("badgerTeemo").style.display = 'none';
	}
    
    
    // Panda Teemo
    if(teemosSlain>=pandaTeemo.unlockRequirement){
        
        if(document.getElementById("pandaTeemo").style.display === "none"){
            notify("Teemo Skin Unlocked!", "You have unlocked 'Panda Teemo'!", 5000, 120, 1000)       
        }
        
		document.getElementById("pandaTeemo").style.display = "initial";
	}
	else{
		document.getElementById("pandaTeemo").style.display = 'none';
	}
    
    
    // Omega Squad Teemo
    if(teemosSlain>=omegaSquadTeemo.unlockRequirement){
        
        if(document.getElementById("omegaSquadTeemo").style.display === "none"){
            notify("Teemo Skin Unlocked!", "You have unlocked 'Omega Squad Teemo'!", 5000, 120, 1000)       
        }
        
		document.getElementById("omegaSquadTeemo").style.display = "initial";
	}
	else{
		document.getElementById("omegaSquadTeemo").style.display = 'none';
	}

};

function updateSkinDataInterface (teemoSkin) {
if(teemosSlain >= teemoSkin.unlockRequirement){
	if(teemoSkin.owned===0){
		
        // dynamic cost
        document.getElementById(teemoSkin.name + "Cost").innerHTML = prettyBigNumber(teemoSkin.cost)
        
        
		if(teemoSkin.cost<=roundGold){
			document.getElementById(teemoSkin.name + "Cost").style.color = "green";
		}
		else{
			document.getElementById(teemoSkin.name + "Cost").style.color = "red";
		}
	}
	
	else{
    document.getElementById("unequipSkinsButton").style.display = "inline-block";  // if any skin is purchased, user should be able to see unequip skins button
	document.getElementById(teemoSkin.name + "CostSpan").innerHTML = "<b>Skin owned</b>";
	document.getElementById(teemoSkin.name + "CostSpan").style.color = "orange";
	document.getElementById(teemoSkin.name + "BuyButton").style.display = "none";
    document.getElementById(teemoSkin.name + "UseButton").style.display = "";
	}
}
};

function buyTeemoSkin(teemoSkin) { // YOBO: you only buy once.
	if(gold>=teemoSkin.cost){
		gold = gold - teemoSkin.cost;
		teemoSkin.owned = 1;
		computeGoldPerSecond();
		updateInterface();
	}
};


function updateMainButtonPortraitInterface(){
    document.getElementById("mainButtonIcon").src = mainButtonTeemoPortrait;
}

function useTeemoSkin(teemoSkin){
    mainButtonTeemoPortrait = teemoSkin.portraitLocation;
    updateMainButtonPortraitInterface();
}


// name, cost, required number of slain teemos, power
var classicTeemo = new TeemoSkin("Teemo", 0, 0, 0, "files/teemoPortraits/teemo_face.jpg") // dummy construct, just for skin unequip
var reconTeemo = new TeemoSkin("reconTeemo", 1000000, 900, 0.2, "files/teemoPortraits/recon_teemo_face.jpg");
var cottontailTeemo = new TeemoSkin("cottontailTeemo", 100000000, 90000, 0.25, "files/teemoPortraits/cottontail_teemo_face.jpg");
var astronautTeemo = new TeemoSkin("astronautTeemo", 10000000000, 9000000, 0.3, "files/teemoPortraits/astronaut_teemo_face.jpg");
var superTeemo = new TeemoSkin("superTeemo", 1000000000000, 900000000, 0.35, "files/teemoPortraits/super_teemo_face.jpg");
var badgerTeemo = new TeemoSkin("badgerTeemo", 100000000000000, 90000000000, 0.4, "files/teemoPortraits/badger_teemo_face.jpg");
var pandaTeemo = new TeemoSkin("pandaTeemo", 10000000000000000, 9000000000000, 0.45, "files/teemoPortraits/panda_teemo_face.jpg");
var omegaSquadTeemo = new TeemoSkin("omegaSquadTeemo", 1000000000000000000, 900000000000000, 0.5, "files/teemoPortraits/omega_squad_teemo_face.jpg");

/*=====================================================
		CHOOSE YOUR PASSIVE 
=====================================================*/
var avatars = ['Gangpank','Kayle', 'Tryndamere']
function setPassive(choice) {
	
	

	
	passiveChoice = choice;
	
	if(choice===0){// Not chosen or reset
		document.getElementById("chosenPassiveDescription" ).innerHTML = "<i>No passive chosen yet.</i>";
		document.getElementById("chosenPassiveIcon").src = "files/passives/unknown.jpg";
	}
	
	else if(choice===1){ //Gangplank
		document.getElementById("chosenPassiveDescription" ).innerHTML = "<b>Gold Plunder</b> <br/><br/> <i>Gold per second increased by 10%. </i>";
		document.getElementById("chosenPassiveIcon").src = "files/passives/gangplank_passive.jpg";
	}
	
	else if(choice === 2){ //Kayle
		document.getElementById("chosenPassiveDescription" ).innerHTML = "<b>Holy Fervor</b> <br/><br/> <i>15% of your AD is added to your AP, 15% of your AP is added to your AD.</i>";
		document.getElementById("chosenPassiveIcon").src = "files/passives/kayle_passive.jpg";
	}
	
	else if(choice === 3){ //Tryndamere
		document.getElementById("chosenPassiveDescription" ).innerHTML = "<b>Battle Fury</b> <br/><br/> <i>Cursor hit power increased by 20%</i>";
		document.getElementById("chosenPassiveIcon").src = "files/passives/tryndamere_passive.jpg";
	}
	
	else if(choice === 4){ //Urf
		document.getElementById("chosenPassiveDescription" ).innerHTML = "<b> Big Blue Watery Road: </b> <br/><br/> <i>Cooldown Reduction is now 80%, and is not affected by items</i>";
		document.getElementById("chosenPassiveIcon").src = "files/passives/urf_passive.jpg";
	}
	else {
		console.log("Error: invalid passive choice");
	}
	
    computeGlobalCooldownReduction();
	computeCursorHitPower();
	computeGoldPerSecond();
	updateInterface();
	hidePassives();
	//document.getElementById("chooseYourPassive").style.display = 'none';
	//document.getElementByid("").style.display = 'block';
	

function hidePassives(){
	$("#chooseYourPassive").slideUp(500);
}

	
};

/*=====================================================
		CHAMPIONS
=====================================================*/
// 
var championCostIncreaseFactor = 1.2


// Champion constructor
function Champion(name, baseCost, baseGoldPerSecond, type, minGoldToDiscover) {
	// Properties
	this.name = name;
	this.baseCost = baseCost;
	this.baseGoldPerSecond = baseGoldPerSecond;
	this.level = 0;
	this.type = type;
	this.upgrade18Owned = 0;
    this.minGoldToDiscover = minGoldToDiscover;
	
	
	// Methods
	this.cost = function() {
		return Math.round(this.baseCost * Math.pow(championCostIncreaseFactor,this.level)); //Champion cost increase economics
	};
	
    this.costBuyX = function(numberOfLevelsToBuy){
        return Math.round(this.cost() * ((1 - Math.pow(championCostIncreaseFactor, numberOfLevelsToBuy))/(1 - championCostIncreaseFactor)))
    }
	
	this.owned = function() {
		if(this.level > 0){
			return 1;
			}
		else {
			return 0;
			}
	 };
	 
	
	 this.goldPerSecond = function() {
		
		//these variables are created every time the function is called
		var effectiveArmor = teemoArmor;
		var effectiveMagicResistance = teemoMagicResistance;
		
		if(this.type === 'AD') {
			var temp =  prettify((this.baseGoldPerSecond * this.level * (1 + 0.2*globalAD/100))* Math.pow(2, this.upgrade18Owned)); //GpS without resistances
			
			effectiveArmor = (effectiveArmor * ( 1 - percentageArmorPenetration)) - armorPenetration; //GpS reduction formula
			if(effectiveArmor<=0) effectiveArmor =0; //can't go below 0 for now
			
			return temp * (100/(100 + effectiveArmor));
			
		}
		
		else if(this.type === 'AP') {
			var temp = prettify((this.baseGoldPerSecond * this.level * (1 + 0.3*globalAP/100)) * Math.pow(2, this.upgrade18Owned));
			
			effectiveMagicResistance = (effectiveMagicResistance * ( 1 - percentageMagicPenetration)) - magicPenetration; //GpS reduction formula
			if(effectiveMagicResistance<=0) effectiveMagicResistance =0; //can't go below 0 for now
			
			return temp * (100/(100 + effectiveMagicResistance));
		
		}
		
		else{ // 	HYBRID
			var temp = prettify((this.baseGoldPerSecond * this.level * (1 + 0.2*globalAD/100 + 0.3*globalAP/100)) * Math.pow(2, this.upgrade18Owned));
			
			effectiveMagicResistance = (effectiveMagicResistance * ( 1 - percentageMagicPenetration)) - magicPenetration; //GpS reduction formula
			if(effectiveMagicResistance<=0) effectiveMagicResistance =0; //can't go below 0 for now
			
			effectiveArmor = (effectiveArmor * ( 1 - percentageArmorPenetration)) - armorPenetration; //GpS reduction formula
			if(effectiveArmor<=0) effectiveArmor =0; //can't go below 0 for now
			
			var effectiveHybridResistance = Math.min(effectiveArmor, effectiveMagicResistance); 
			return temp * (100/(100 + effectiveHybridResistance)) ;
		
		}		
		
	 };
	
};

// Leveling up a champions increases its gold generation.
function levelUpChampion(champion) {
	if(gold>=champion.cost()) {
		gold = gold- champion.cost();
		champion.level = champion.level + 1;		
		computeGoldPerSecond();
		showChampionsUpgrades ();
        showChampionSpellsBlocks();
		checkAchievementsUnlocked();
		computeGlobalAD();
		computeGlobalAP();
		updateInterface();
		
	}
};
	

function levelUpChampionXTimes(champion, numberOfLevelsToBuy){
    if(gold >= champion.costBuyX(numberOfLevelsToBuy)) {
		gold = gold - champion.costBuyX(numberOfLevelsToBuy);
		champion.level = champion.level + numberOfLevelsToBuy;		
		computeGoldPerSecond();
		showChampionsUpgrades ();
        showChampionSpellsBlocks();
		checkAchievementsUnlocked();
		computeGlobalAD();
		computeGlobalAP();
		updateInterface();
		
	}
}


// Update all displayed data, incorporated in updateChampionsInterface()
function updateChampionInterface(champion) {

    // bread crumbling
    if((champion.minGoldToDiscover>1)&&(totalGoldGained >= champion.minGoldToDiscover)){
        document.getElementById(champion.name + "UnknownBlock").style.display = "none";
        document.getElementById(champion.name + "ChampionBlock").style.display = "";
    }
    
    
	// level
	if(champion.level !== 0){
	document.getElementById(champion.name + "Level").innerHTML = "Level " + champion.level;
	}
	else{
	document.getElementById(champion.name + "Level").innerHTML = "Not owned";
	}
	
	// cost
	document.getElementById(champion.name + "Cost").innerHTML = addCommas(prettyBigNumber(champion.cost()));
	if(champion.cost()<=roundGold){
	document.getElementById(champion.name + "Cost").style.color = "green";
	}
	else{
	document.getElementById(champion.name + "Cost").style.color = "red";
	}
    
 	// buy 10 cost
	document.getElementById(champion.name + "Buy10Cost").innerHTML = addCommas(prettyBigNumber(champion.costBuyX(10)));
	if(champion.costBuyX(10)<=roundGold){
	document.getElementById(champion.name + "Buy10Cost").style.color = "green";
	}
	else{
	document.getElementById(champion.name + "Buy10Cost").style.color = "red";
	}   
    
	
	// displayed GpS
	if(champion.owned()){
		document.getElementById(champion.name + "DisplayedGpS").innerHTML = addCommas(prettyBigNumber(champion.goldPerSecond()));
	}
};

// champion ultimates to be added in future
// champion, baseCost, basegoldpersec, type


/*
// DESIGN IDEA: SET THE TIME TO RECOVER INVESTMENT WITH AN INCREASING FACTOR, TEST OUT MULTIPLE VALUES
// FOR HYBRID CHAMPIONS (STRONGER THAN NORMAL CHAMPIONS, INCREASE IT BY AN ADDITIONAL 1.5)

var baseTimeToRecover = 100
var increaseFactorForEveryChampion = 1.4
var increaseFactorForHybridChampion = 1.5


var ryze = new Champion("ryze", 10, 10/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 0))  , 'AP');  
var darius = new Champion("darius", 75, 75/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 1)), 'AD');
var rumble = new Champion("rumble", 450, 450/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 2)), 'AP');
var riven = new Champion("riven", 2718, 2718/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 3)), 'AD');
var syndra = new Champion("syndra", 19999, 19999/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 4)), 'AP');
var pantheon = new Champion("pantheon", 100000, 100000/(baseTimeToRecover * Math.pow(increaseFactorForEveryChampion, 5)), 'AD'); 
var mordekaiser = new Champion("mordekaiser", 666666, 666666/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 6)), 'AP');
var leeSin = new Champion("leeSin", 5000000, 5000000/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 7)), 'AD');
var kassadin = new Champion("kassadin", 150000000, 150000000/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 8)), 'AP');
var zed = new Champion("zed", 7000000000, 7000000000/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 9)), 'AD');
var heimerdinger = new Champion("heimerdinger", 133700000000, 133700000000/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 10)), 'AP');
var draven = new Champion("draven", 10000000000000, 10000000000000/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 11)), 'AD');
var akali = new Champion("akali", 7000000000000000, 7000000000000000/(increaseFactorForHybridChampion * baseTimeToRecover * Math.pow(increaseFactorForEveryChampion, 12)), 'HYBRID'); 
var aurelionSol = new Champion("aurelionSol", 300000000000000000, 300000000000000000/(baseTimeToRecover*Math.pow(increaseFactorForEveryChampion, 13)), 'AP');
*/

// commented is the basic time to recover investment in seconds
// the time increases drastically later on, because the game has to progress slower, and at the same time the player has access to many other GpS multipliers

var ryze = new Champion("ryze", 10, 0.1, 'AP', 0); // 100
var darius = new Champion("darius", 75, 0.6, 'AD', 0); // 125
var rumble = new Champion("rumble", 475, 3.6, 'AP', 0); // 150
var riven = new Champion("riven", 2700, 17, 'AD', 2000); // 181
var syndra = new Champion("syndra", 20000, 60, 'AP', 15000); // 200
var pantheon = new Champion("pantheon", 100000, 240, 'AD', 75000); // 333 
var mordekaiser = new Champion("mordekaiser", 666666, 1000, 'AP', 500000); // 666
var leeSin = new Champion("leeSin", 5000000, 4000, 'AD', 3500000); // 833
var kassadin = new Champion("kassadin", 120000000, 25000, 'AP', 60000000); // 1,500
var zed = new Champion("zed", 2000000000, 200000, 'AD', 1500000000); // 4,666
var heimerdinger = new Champion("heimerdinger", 21000000000, 1200000, 'AP', 15000000000); // 10,000
var draven = new Champion("draven", 230000000000, 9300000, 'AD', 180000000000); // 18,000
var akali = new Champion("akali", 2200000000000, 54500000, 'HYBRID', 1800000000000); // 2,333,333
var aurelionSol = new Champion("aurelionSol", 18000000000000, 350000000, 'AP', 14000000000000); // 4,000,000


/*=====================================================
		CHAMPION SPELLS
=====================================================*/

var maxSpellsEquippedNumber = 4; // can be increased with upgrades (??)
var totalSpellsEquipped = 0;
var spellsBuild = new Array(); //


// Champion constructor
function ChampionSpell(name, iconUrl, baseCooldown, ownerChampion, unlockChampionLevelRequirement, prettyName) {
    this.name = name;
    this.level = 0;
    this.equipped = 0;
    this.unlocked = 0;
    this.iconUrl = iconUrl;
    this.baseCooldown = baseCooldown;
    this.ownerChampion = ownerChampion;
    this.unlockChampionLevelRequirement = unlockChampionLevelRequirement;
    this.prettyName = prettyName;
    
    this.currentCooldown = 0;  //initiate this at 0
	
};


function updateTotalSpellsEquipped(){
    totalSpellsEquipped = ryzeOverload.equipped + rivenBrokenWings.equipped + mordekaiserChildrenOfTheGrave.equipped + zedDeathMark.equipped;
}

function championSpellEffectiveCooldown(championSpell){
    return championSpell.baseCooldown * (1-globalCooldownReduction)
}

// champion spells cooldowns
window.setInterval(function(){
    for(i=0; i<maxSpellsEquippedNumber; i++){
        if(spellsBuild[i]){
            if(spellsBuild[i].currentCooldown>=1){
                spellsBuild[i].currentCooldown = spellsBuild[i].currentCooldown - 1;
            }

            else{
                spellsBuild[i].currentCooldown = 0;
            }
        }
    }
    updateDisplayedSpellsInventory();
}, 1000)


var ryzeOverload = new ChampionSpell("ryzeOverload", "files/spells/ryze_overload.jpg", 10, ryze, 1, "Overload");
var rivenBrokenWings = new ChampionSpell("rivenBrokenWings", "files/spells/riven_broken_wings.jpg", 30, riven, 1, "Broken Wings")
var mordekaiserChildrenOfTheGrave = new ChampionSpell("mordekaiserChildrenOfTheGrave", "files/spells/mordekaiser_children_of_the_grave.jpg", 210, mordekaiser, 6, "Children of the Grave")
var zedDeathMark = new ChampionSpell("zedDeathMark", "files/spells/zed_death_mark.jpg", 180, zed, 6, "Death Mark")
// EVERY SPELL IS CODED UNIQUELY?



// actual spells code
function castRyzeOverload(){
    // hit with damage
    overloadPower = 2 + (1.5*globalAP) + (0.002*globalAP*goldPerSecond);
    hitTeemoWithSpell(ryzeOverload, overloadPower, teemoMagicResistance, 'AP')
    
    // reduce cooldown of other spells
    for(i=0; i<maxSpellsEquippedNumber; i++){
        if((spellsBuild[i]) && (spellsBuild[i].name!=="ryzeOverload")){
            if(spellsBuild[i].currentCooldown>=1){
                spellsBuild[i].currentCooldown = spellsBuild[i].currentCooldown - 1;
            }

            else{
                spellsBuild[i].currentCooldown = 0;
            }
        }
    }
    
    updateDisplayedSpellsInventory();
    
}

function castRivenBrokenWings(){
    // hit 3 times. last strike multiplier is based on riven level
    brokenWingsPower = 15 + (2*globalAD) + (0.003*globalAD*goldPerSecond); // first strike
    lastStrikePower = brokenWingsPower * (2 + riven.level*0.05)
    


    hitTeemoWithSpell(rivenBrokenWings, brokenWingsPower, teemoArmor, 'AD')
    
    setTimeout(function(){
        hitTeemoWithSpell(rivenBrokenWings, brokenWingsPower, teemoArmor, 'AD'); 
        setTimeout(function(){  hitTeemoWithSpell(rivenBrokenWings, lastStrikePower, teemoArmor, 'AD'); }, 1300);
    }, 1300);
    
}


// If you are reading this: this code is messy, as is Lol's Mordekaiser code. This fits the theme! :)
var childrenOfTheGraveBuffActive = 0;
function childrenOfTheGraveBonusAP(){
    return childrenOfTheGraveBuffActive * (100 + globalAP*0.2);
} 
function childrenOfTheGraveBonusAD(){
    return 0; // for now set this to 0. change this in the future if needed
} 
function castMordekaiserChildrenOfTheGrave(){
    // Does 3 things: first hit teemo with half the power. then hit teemo with a dot of the remaining half. for the duration, gain a bonus AP and AD.
    var childrenOfTheGraveTotalPower = 4000 + (3*globalAP) + (0.008*globalAP*goldPerSecond);
    childrenOfTheGraveBuffActive = 1
    computePlayerStats();
    hitTeemoWithSpell(mordekaiserChildrenOfTheGrave, childrenOfTheGraveTotalPower/2, teemoMagicResistance, 'AP') // first hit for half the damage
    
    // hit him 4 times over the next 10s with the other 1/2 of the damage split in 1/8 to make 1/1 total.
    setTimeout(function(){
        hitTeemoWithSpell(mordekaiserChildrenOfTheGrave, childrenOfTheGraveTotalPower/8, teemoMagicResistance, 'AP');
        
            setTimeout(function(){
                hitTeemoWithSpell(mordekaiserChildrenOfTheGrave, childrenOfTheGraveTotalPower/8, teemoMagicResistance, 'AP');
                
                setTimeout(function(){
                    hitTeemoWithSpell(mordekaiserChildrenOfTheGrave, childrenOfTheGraveTotalPower/8, teemoMagicResistance, 'AP');
                    
                    setTimeout(function(){
                        hitTeemoWithSpell(mordekaiserChildrenOfTheGrave, childrenOfTheGraveTotalPower/8, teemoMagicResistance, 'AP'); 
                        childrenOfTheGraveBuffActive = 0
                        computePlayerStats();
                    }, 2500);

                }, 2500);

            }, 2500);

    }, 2500);

}


function castZedDeathMark(){
    // works based on total gold gained. Does this make sense in all cases?
    var goldStartDeathMark = totalGoldGained;
    
    setTimeout(function(){
        var goldDifference = totalGoldGained - goldStartDeathMark;
        deathMarkPower = 3000000 + (0.02*globalAD*goldPerSecond) + goldDifference*(0.8 + 0.10*zed.level);
        hitTeemoWithSpell(zedDeathMark, deathMarkPower, teemoArmor, 'AD')
    }, 3000);
    

}


function castChampionSpell(input){
    if(spellsBuild[input]!==undefined && spellsBuild[input].currentCooldown===0){
          
        spellsDictionary[spellsBuild[input].name]();
        spellsBuild[input].currentCooldown = championSpellEffectiveCooldown(spellsBuild[input]);
        
        

    }
    
    updateDisplayedSpellsInventory();
}



function showChampionSpellsBlocks() {
    // RYZE OVERLOAD
	if(ryze.level>=ryzeOverload.unlockChampionLevelRequirement){
        if(ryzeOverload.unlocked===0){
            notify("New Spell Unlocked!", "You have unlocked Overload", 5000, 120, 1000) 
        }
        ryzeOverload.unlocked = 1;
		document.getElementById("ryzeSpells").style.display = 'inline-block';
	}
	else{
        ryzeOverload.unlocked = 0;
		document.getElementById("ryzeSpells").style.display='none';
	}

    
    // RIVEN BROKEN WINGS
	if(riven.level>=rivenBrokenWings.unlockChampionLevelRequirement){
        if(rivenBrokenWings.unlocked===0){
            notify("New Spell Unlocked!", "You have unlocked Broken Wings", 5000, 120, 1000) 
        }
        rivenBrokenWings.unlocked = 1;
		document.getElementById("rivenSpells").style.display = 'inline-block';
	}
	else{
        rivenBrokenWings.unlocked = 0;
		document.getElementById("rivenSpells").style.display='none';
	}
	
    
    // MORDEKAISER CHILDREN OF THE GRAVE
    if(mordekaiser.level>=mordekaiserChildrenOfTheGrave.unlockChampionLevelRequirement){
        if(mordekaiserChildrenOfTheGrave.unlocked===0){
            notify("New Spell Unlocked!", "You have unlocked Children of the Grave", 5000, 120, 1000) 
        }
        mordekaiserChildrenOfTheGrave.unlocked = 1;
		document.getElementById("mordekaiserSpells").style.display = 'inline-block';
	}
	else{
        mordekaiserChildrenOfTheGrave.unlocked = 0;
		document.getElementById("mordekaiserSpells").style.display='none';
	}
    
    
    // ZED DEATH MARK
    if(zed.level>=zedDeathMark.unlockChampionLevelRequirement){
        if(zedDeathMark.unlocked===0){
            notify("New Spell Unlocked!", "You have unlocked Death Mark", 5000, 120, 1000) 
        }
        zedDeathMark.unlocked = 1;
		document.getElementById("zedSpells").style.display = 'inline-block';
	}
	else{
        zedDeathMark.unlocked = 0;
		document.getElementById("zedSpells").style.display='none';
	}
    
};



function equipChampionSpell(championSpell) {
	if((totalSpellsEquipped < maxSpellsEquippedNumber) && (championSpell.equipped === 0)){
		championSpell.equipped = 1;
		spellsBuild.push(championSpell);
		updateDisplayedSpellsInventory();
		updateInterface();
		
		
		
	}
		
};

// Removes the first instance of the sold item from the itemBuild, without leaving any holes in the array.
function removeUnequippedSpell(championSpell){
	i = 0;
	
	while(spellsBuild[i].name !== championSpell.name){
		i = i+1;
	}
	championSpell.currentCooldown = spellsBuild[i].currentCooldown;
    
	spellsBuild.splice(i , 1);
}

function unequipChampionSpell(championSpell) {
	if(championSpell.equipped===1){
        championSpell.equipped = 0;
        
        removeUnequippedSpell(championSpell)
		updateDisplayedSpellsInventory();

		updateInterface();
		
	};
	
};


var spellsDictionary = {
    // MATCHES THE SPELL NAME WITH THE FUNCTION THAT ACTUALLY IMPLEMENTS THE SPELL CODE (EVERY SPELL HAS UNIQUE EFFECTS, AND AS SUCH IS CODED DIFFERENTLY)
    ryzeOverload: castRyzeOverload,
    rivenBrokenWings: castRivenBrokenWings,
    mordekaiserChildrenOfTheGrave: castMordekaiserChildrenOfTheGrave,
    zedDeathMark: castZedDeathMark,
}

/*=====================================================
		CHAMPION UPGRADES
=====================================================*/
/* All of this must be implemented in the champion object constructor, for easier future updates 
create a function that computes the cost of the lvl 18 upgrade (~ 100*baseCost)
championUpgrade object to be erased.
*/

//champion upgrade constructor
function ChampionUpgrade (champion, name, cost) {
	this.champion = champion;
	this.name = name;
	this.cost = cost;
	this.owned = 0;
};


//Level 18 upgrades
var ryzeUpgrade18 = new ChampionUpgrade(ryze, "ryzeUpgrade18", 1000);
var dariusUpgrade18 = new ChampionUpgrade(darius, "dariusUpgrade18", 7500);
var rumbleUpgrade18 = new ChampionUpgrade(rumble, "rumbleUpgrade18", 47500);
var rivenUpgrade18 = new ChampionUpgrade(riven, "rivenUpgrade18", 270000);
var syndraUpgrade18 = new ChampionUpgrade(syndra, "syndraUpgrade18", 2000000);
var pantheonUpgrade18 = new ChampionUpgrade(pantheon, "pantheonUpgrade18", 10000000);
var mordekaiserUpgrade18 = new ChampionUpgrade(mordekaiser, "mordekaiserUpgrade18", 66666666);
var leeSinUpgrade18 = new ChampionUpgrade(leeSin, "leeSinUpgrade18", 500000000);
var kassadinUpgrade18 = new ChampionUpgrade(kassadin, "kassadinUpgrade18", 12000000000);
var zedUpgrade18 = new ChampionUpgrade(zed, "zedUpgrade18", 200000000000);
var heimerdingerUpgrade18 = new ChampionUpgrade(heimerdinger, "heimerdingerUpgrade18", 2100000000000);
var dravenUpgrade18 = new ChampionUpgrade(draven, "dravenUpgrade18", 23000000000000);
var akaliUpgrade18 = new ChampionUpgrade(akali, "akaliUpgrade18", 220000000000000);
var aurelionSolUpgrade18 = new ChampionUpgrade(aurelionSol, "aurelionSolUpgrade18", 1800000000000000);




function buyChampionUpgrade(championUpgrade, champion) {
	if(gold>=championUpgrade.cost){
	gold = gold - championUpgrade.cost;
	champion.upgrade18Owned = 1;
	championUpgrade.owned = 1;
	updateChampionUpgradeInterface(championUpgrade);
	computeGoldPerSecond();
    computePlayerStats();
	updateInterface();
	}
};

// Really ugly, but I didn't find another way to do this.
function showChampionsUpgrades() {
	if(ryze.level>=18){
		document.getElementById("ryzeUpgrade18").style.display = 'inline-block';
	}
	else{
		document.getElementById("ryzeUpgrade18").style.display='none';
	}
	
	if(darius.level>=18){
		document.getElementById("dariusUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("dariusUpgrade18").style.display='none';
	}
	
	if(rumble.level>=18){
		document.getElementById("rumbleUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("rumbleUpgrade18").style.display='none';
	}
	
	if(riven.level>=18){
		document.getElementById("rivenUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("rivenUpgrade18").style.display='none';
	}
	
	if(syndra.level>=18){
		document.getElementById("syndraUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("syndraUpgrade18").style.display='none';
	}
	
	if(pantheon.level>=18){
		document.getElementById("pantheonUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("pantheonUpgrade18").style.display='none';
	}
	
	if(mordekaiser.level>=18){
		document.getElementById("mordekaiserUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("mordekaiserUpgrade18").style.display='none';
	}
	
	if(leeSin.level>=18){
		document.getElementById("leeSinUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("leeSinUpgrade18").style.display='none';
	}
	
	if(kassadin.level>=18){
		document.getElementById("kassadinUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("kassadinUpgrade18").style.display='none';
	}
	
	if(zed.level>=18){
		document.getElementById("zedUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("zedUpgrade18").style.display='none';
	}
	
	if(heimerdinger.level>=18){
		document.getElementById("heimerdingerUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("heimerdingerUpgrade18").style.display='none';
	}
	
	if(draven.level>=18){
		document.getElementById("dravenUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("dravenUpgrade18").style.display='none';
	}
	
	if(akali.level>=18){
		document.getElementById("akaliUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("akaliUpgrade18").style.display='none';
	}
	
	if(aurelionSol.level>=18){
		document.getElementById("aurelionSolUpgrade18").style.display = 'inline-block';
	}
		else{
		document.getElementById("aurelionSolUpgrade18").style.display='none';
	}
	
};

function updateChampionUpgradeInterface (championUpgrade) {
	if(championUpgrade.champion.level >= 18){
	
	if(championUpgrade.owned===0){
		// costaddCommas(prettyBigNumber(item.cost()))
        document.getElementById(championUpgrade.name + "Cost").innerHTML = addCommas(prettyBigNumber(championUpgrade.cost))
        
		if(championUpgrade.cost<=roundGold){
			document.getElementById(championUpgrade.name + "Cost").style.color = "green";
		}
		else{
			document.getElementById(championUpgrade.name + "Cost").style.color = "red";
		}
	}
	
	else{
	document.getElementById(championUpgrade.name + "CostSpan").innerHTML = "<b>Owned</b>";
	document.getElementById(championUpgrade.name + "CostSpan").style.color = "orange";
	document.getElementById(championUpgrade.name + "BuyButton").style.display = "none";
	
	}
	}
};
	
/*=====================================================
		ITEMS
=====================================================*/

var maxItemsNumber = 6; // can be increased with upgrades (??)
var totalItemsOwned = 0;
var itemBuild = new Array(); //

// Item constructor
function Item(name, baseCost, iconUrl, hasSpell) {
	
	//properties
	this.name = name;
	this.baseCost = baseCost;
	this.number = 0;	
	this.iconUrl = iconUrl;
    this.hasSpell = hasSpell;
	
	//methods
	this.cost = function() {
		
		return this.baseCost; //TEST
	};
	
	this.owned = function() {
		if(this.number > 0){
			return 1;
			}
		else {
			return 0;
			}
	 };
    
    /*
    this.spellIsOnCooldown = function(){
        if(this.name === "trinityForce") return spellBladeOnCooldown()
        if(this.name === "ghostblade") return frenzyOnCooldown()
        if(this.name === "deathfireGrasp") return doomOnCooldown()
        else return 0;
    }
    */
    
};	

// declared outside of scope of item
itemSpellIsOnCooldown = function(inputItem){
        if(inputItem.name === "trinityForce") return spellBladeOnCooldown()
        if(inputItem.name === "ghostblade") return frenzyOnCooldown()
        if(inputItem.name === "deathfireGrasp") return doomOnCooldown()
        else return 0;
}


// Update all displayed data, incorporated in updateItemsInterface()

function updateItemInterface(item) {
	document.getElementById(item.name + "Cost").innerHTML = addCommas(prettyBigNumber(item.cost()));
	document.getElementById(item.name + "Number").innerHTML = item.number;
	
	
	if(item.cost()<=roundGold && totalItemsOwned < maxItemsNumber){  // cost must turn red if gold isn't enough or if you already have 6 items.
	document.getElementById(item.name + "Cost").style.color = "green";
	}
	else{
	document.getElementById(item.name + "Cost").style.color = "red";
	}
};


function updateGoldGainedFromSellingAllItems(){
    var possibleGoldGainedBack = 0;
    
    for(var i=0; i<maxItemsNumber; i++) {	
		if(itemBuild[i]){ // if there's actually an item, not an empty slot
            possibleGoldGainedBack = possibleGoldGainedBack + itemBuild[i].baseCost/2
        }
    }
    
    document.getElementById("goldGainedFromSellingAllItems").innerHTML = addCommas(prettyBigNumber(possibleGoldGainedBack));
}

function buyItem(item) {
	if(gold>=item.cost() && totalItemsOwned < maxItemsNumber){
		gold = gold - item.cost();
		item.number = item.number + 1;
		itemBuild.push(item);
		computePlayerStats();
		showHideItemSpells();
		updateDisplayedInventory();
		computeGoldPerSecond();
		computeCursorHitPower();
		updateTotalItemsOwned();
		updateInterface();
		
		
		
	}
		
};

function sellItem(item) {
	if(item.number>0){
		gold = gold + 0.5*item.cost(); //
		item.number = item.number - 1;
		deleteSoldItem(item);
		showHideItemSpells();
		updateDisplayedInventory();
		computePlayerStats();
		computeGoldPerSecond();
		computeCursorHitPower();
		updateTotalItemsOwned();
		updateInterface();
		
	};
	
};


function useItem(input){
    
    if (itemBuild[input]!==undefined){
        var itemName = itemBuild[input].name;
        if(itemName === "ghostblade"){
            useFrenzy();
        }

        if(itemName === "deathfireGrasp"){
            useDoom();
        }
    }
}


function sellAllItems(){
    for(i=0;i<=6;i++){
			sellItem(doransBlade);
			sellItem(doransRing);
			sellItem(brutalizer);
			sellItem(hauntingGuise);
			sellItem(lightbringer);
			sellItem(lastWhisper);
			sellItem(voidStaff);
			sellItem(bloodthirster);
			sellItem(rabadonsDeathcap);
			sellItem(phantomDancer);
			sellItem(nashorsTooth);
			sellItem(trinityForce);
			sellItem(ghostblade);
			sellItem(infinityEdge);
			sellItem(deathfireGrasp);
    }
    notify("Items sold!", "", 600, 50, 400)
    
}


// name, basecost
var doransBlade = new Item("doransBlade" , 100, "files/items/dorans_blade.jpg", hasSpell=0);
var doransRing = new Item("doransRing", 100, "files/items/dorans_ring.jpg", hasSpell=0);
var brutalizer = new Item("brutalizer", 750, "files/items/brutalizer.jpg", hasSpell=0);
var hauntingGuise = new Item("hauntingGuise", 815, "files/items/haunting_guise.jpg", hasSpell=0);
var lightbringer = new Item("lightbringer", 2000, "files/items/lightbringer.jpg", hasSpell=0);
var lastWhisper = new Item("lastWhisper", 3000, "files/items/last_whisper.jpg", hasSpell=0);
var voidStaff = new Item("voidStaff", 3000, "files/items/void_staff.jpg", hasSpell=0);
var bloodthirster = new Item("bloodthirster", 10000, "files/items/bloodthirster.jpg", hasSpell=0);
var rabadonsDeathcap = new Item("rabadonsDeathcap", 10000, "files/items/rabadons_deathcap.jpg", hasSpell=0);
var phantomDancer = new Item("phantomDancer", 30000, "files/items/phantom_dancer.jpg", hasSpell=0)
var nashorsTooth = new Item("nashorsTooth", 35000, "files/items/nashors_tooth.jpg", hasSpell=0)
var trinityForce = new Item("trinityForce", 50000, "files/items/trinity_force.jpg", hasSpell=1);
var ghostblade = new Item("ghostblade", 50000, "files/items/ghostblade.jpg", hasSpell=1);
var infinityEdge = new Item("infinityEdge", 100000, "files/items/infinity_edge.jpg", hasSpell=0);
var deathfireGrasp = new Item("deathfireGrasp", 100000, "files/items/deathfire_grasp.jpg", hasSpell=1);



/*=====================================================
		RIP TIER ITEMS
=====================================================*/
// RIP items are different: no inventory limits, and cost ramps up quickly (because they're op).

var ripItemsUnlocked = 0

function RipItem(name, baseCost, iconUrl, costIncreaseFactor, gpsBonus) {
	
	//properties
	this.name = name;
	this.baseCost = baseCost;
	this.number = 0;	
	this.iconUrl = iconUrl;
    this.costIncreaseFactor = costIncreaseFactor;
    this.gpsBonus = gpsBonus;
	
	//methods
	this.cost = function() {
		
		return this.baseCost * Math.pow(costIncreaseFactor, this.number); // Increases by a factor of 11
	}
	
	this.owned = function() {
		if(this.number > 0){
			return 1;
			}
		else {
			return 0;
			}
	 }
}	


function updateRipItemInterface(ripItem) {
	document.getElementById(ripItem.name + "Cost").innerHTML = addCommas(prettyBigNumber(ripItem.cost()));
	document.getElementById(ripItem.name + "Number").innerHTML = ripItem.number;
	
	
	if(ripItem.cost()<=roundGold){  // cost must turn red if gold isn't enough 
	document.getElementById(ripItem.name + "Cost").style.color = "green";
	}
	else{
	document.getElementById(ripItem.name + "Cost").style.color = "red";
	}
    
    
    // dynamic necklace icon
    if(ripItem.name==="bonetoothNecklace"){ // update necklace image based on the % of achievements unlocked: neat
        var percentageOfAchievementsUnlocked = numofUnlockedAchievements/numofAllAchievements;
        
        if((percentageOfAchievementsUnlocked > 0) && (percentageOfAchievementsUnlocked <= 0.2)){
            document.getElementById("bonetoothNecklaceIcon").src = "files/items/bonetooth_necklace_1.jpg"
        }
        if((percentageOfAchievementsUnlocked > 0.2) && (percentageOfAchievementsUnlocked <= 0.4)){
            document.getElementById("bonetoothNecklaceIcon").src = "files/items/bonetooth_necklace_2.jpg"
        }
        if((percentageOfAchievementsUnlocked > 0.4) && (percentageOfAchievementsUnlocked <= 0.6)){
            document.getElementById("bonetoothNecklaceIcon").src = "files/items/bonetooth_necklace_3.jpg"
        }
        if((percentageOfAchievementsUnlocked > 0.6) && (percentageOfAchievementsUnlocked <= 0.8)){
            document.getElementById("bonetoothNecklaceIcon").src = "files/items/bonetooth_necklace_4.jpg"
        }
        if((percentageOfAchievementsUnlocked > 0.8) && (percentageOfAchievementsUnlocked <= 1)){
            document.getElementById("bonetoothNecklaceIcon").src = "files/items/bonetooth_necklace_5.jpg"
        }     
    }
    
    
};



function checkRipTierUnlocking() { // FIRST RIP ITEM UNLOCKING (notify that a new item tier has been unlocked!) 
    // First two RIP items unlocked are heart of gold and philosopher's stone. 
	if(teemosSlain>=4000){
        
        
        if(ripItemsUnlocked===0){ // first time unlocking RIP tier
            notify("New Item Tier Unlocked!", "You have unlocked RIP items!",5000, 120, 1000);
        }
        
        ripItemsUnlocked = 1    
		document.getElementById("tierRIP").style.display = "initial";
	}
		
};


function buyRipItem(ripItem) {
	if(gold>=ripItem.cost()){
		gold = gold - ripItem.cost();
		ripItem.number = ripItem.number + 1;
		computeGoldPerSecond();
		computeCursorHitPower();
		updateInterface();		
	}
		
};

function sellRipItem(ripItem) {
	if(ripItem.number>0){
		gold = gold + 0.05*ripItem.cost(); //
		ripItem.number = ripItem.number - 1;
		computeGoldPerSecond();
		computeCursorHitPower();
		updateInterface();
		
	};
	
};

// low base cost, but huge increase factor. Test out values of gpsBonus for necklace
var bonetoothNecklace = new RipItem("bonetoothNecklace", 1500000, "files/items/bonetooth_necklace_1.jpg", 15, 0.3) // increases GpS based on achievements unlocked

var heartOfGold = new RipItem("heartOfGold", 9000000, "files/items/heart_of_gold.jpg", 9, 0.165);  // increases GpS
var philosophersStone = new RipItem("philosophersStone", 9000000, "files/items/philosophers_stone.jpg", 9, 0.165);  // increases GpS





/*=====================================================
		ITEM SPELLS
=====================================================*/

//Interface function
function showHideItemSpells() {
	showHideSpellBlade();
	showHideFrenzy();
	showHideDoom();
	
};


//Trinity Force's SPELLBLADE
var spellBladeCooldown = 0;

function showHideSpellBlade() {
	if(trinityForce.owned()){
		document.getElementById("trinityForceSpellBlade").style.display = "inline-block";
	}
	
	else {
		document.getElementById("trinityForceSpellBlade").style.display = "none";
	}
};

function spellBladeOnCooldown() {
	if(spellBladeCooldown === 0){
		return 0;
	}
	
	else{
		return 1;
	}
};

function setSpellBladeCooldown () {
	document.getElementById("spellBladeActive").style.display = 'none';
	spellBladeCooldown = 600 * (1-globalCooldownReduction);
	document.getElementById("spellBladeCooldown").innerHTML = addCommas(spellBladeCooldown);
	document.getElementById("spellBladeCooldown").style.color = "orange";
};


//Ghostblade's FRENZY
var frenzyCooldown = 0;

function showHideFrenzy() {
	if(ghostblade.owned()){
		document.getElementById("ghostbladeFrenzy").style.display = "inline-block";
		document.getElementById("ghostbladeFrenzyActive").style.display = "inline-block";
	}
	
	else {
		document.getElementById("ghostbladeFrenzy").style.display = "none";
		document.getElementById("ghostbladeFrenzyActive").style.display = "none";
	}
};

function frenzyOnCooldown() {
	if(frenzyCooldown === 0){
		return 0;
	}
	
	else{
		return 1;
	}
};

function setFrenzyCooldown () {
	frenzyCooldown = 300 * (1-globalCooldownReduction);
	document.getElementById("frenzyCooldown").innerHTML = addCommas(frenzyCooldown);
	document.getElementById("frenzyCooldown").style.color = "orange";
};

//Deathfire Grasp's DOOM
var doomCooldown = 0;

function showHideDoom() {
	if(deathfireGrasp.owned()){
		document.getElementById("deathfireGraspDoom").style.display = "inline-block";
		document.getElementById("deathfireGraspDoomActive").style.display = "inline-block";
	}
	
	else {
		document.getElementById("deathfireGraspDoom").style.display = "none";
		document.getElementById("deathfireGraspDoomActive").style.display = "none";
	}
};

function doomOnCooldown() {
	if(doomCooldown === 0){
		return 0;
	}
	
	else{
		return 1;
	}
};

function setDoomCooldown () {
	doomCooldown = 420 * (1-globalCooldownReduction);
	document.getElementById("doomCooldown").innerHTML = addCommas(doomCooldown);
	document.getElementById("doomCooldown").style.color = "orange";
};


/*=====================================================
		ITEM USABLE SPELLS
=====================================================*/

// FRENZY
var frenzyIsActive = false;
var frenzyActiveInterval = 0;

function useFrenzy() {
	if(!frenzyOnCooldown()){
		setFrenzyCooldown();
		var frenzyTimeLeft = 10;
		frenzyIsActive = true;
		computeCursorHitPower();
		
		document.getElementById("frenzyActive").style.display = 'inline';
		document.getElementById("frenzyTimeLeft").innerHTML = "Frenzy:" + prettify(frenzyTimeLeft).toString();
		
		frenzyActiveInterval = setInterval(function(){
			if(frenzyTimeLeft >=1){
			
			frenzyTimeLeft = frenzyTimeLeft - 1;
			document.getElementById("frenzyTimeLeft").innerHTML = "Frenzy:" + prettify(frenzyTimeLeft).toString();
			}
			
			else{
				stopFrenzy();
			}
	
		}, 1000)
		
	}
    updateDisplayedInventory();
	
}

function stopFrenzy(){
	clearInterval(frenzyActiveInterval);
	document.getElementById("frenzyTimeLeft").innerHTML = "";
	document.getElementById("frenzyActive").style.display = 'none';
	frenzyIsActive = false;
	computeCursorHitPower();
}

// DOOM
var doomIsActive = 0;
var doomActiveInterval = 0;

function useDoom() {
	if(!doomOnCooldown()){
		setDoomCooldown();
		var doomTimeLeft = 60;
		doomIsActive = 1;
		computeGoldPerSecond();
		document.getElementById("doomActive").style.display = 'inline';
		document.getElementById("doomTimeLeft").innerHTML = "Doom:" + prettify(doomTimeLeft).toString();
		
		doomActiveInterval = setInterval(function(){
			if(doomTimeLeft >=1){
			
			doomTimeLeft = doomTimeLeft - 1;
			document.getElementById("doomTimeLeft").innerHTML = "Doom:" + prettify(doomTimeLeft).toString();
			}
			
			else{
				stopDoom();
			}
	
		}, 1000)
		
	}
    updateDisplayedInventory();
	
}

function stopDoom(){
	clearInterval(doomActiveInterval);
	document.getElementById("doomTimeLeft").innerHTML = "";
	document.getElementById("doomActive").style.display = 'none';
	doomIsActive = 0;
	computeGoldPerSecond();
}


/*=====================================================
		ACHIEVEMENTS
=====================================================*/

// teemo slaying achievements object
function TSAchievement(name, unlockingReq, unlockingMessage){
	this.name = name;
	this.unlockingReq = unlockingReq;
	this.unlocked = 0;
    this.unlockingMessage = unlockingMessage;
}

// build teemo slaying achievements
var firstBlood = new TSAchievement("firstBlood", 1, "First Blood: kill one Teemo");
var recruit = new TSAchievement("recruit", 10, "Recruit: kill 10 Teemos");
var yordleHater = new TSAchievement("yordleHater", 1000, "Yordle Hater: kill 1000 Teemos");
var bronzeSlayer = new TSAchievement("bronzeSlayer", 1000000, "Bronze Slayer: kill 1 million Teemos");
var silverSlayer = new TSAchievement("silverSlayer", 1000000000, "Silver Slayer: kill 1 billion Teemos");
var goldSlayer = new TSAchievement("goldSlayer", 1000000000000, "Gold Slayer: kill 1 trillion Teemos");
var platinumSlayer = new TSAchievement("platinumSlayer", 1000000000000000, "Platinum Slayer: kill 1 quadrillion Teemos");
var diamondSlayer = new TSAchievement("diamondSlayer", 1000000000000000000, "Diamond Slayer: kill 1 quintillion Teemos");
var challengerSlayer = new TSAchievement("challengerSlayer", 1000000000000000000000, "Challenger Slayer: kill 1 sextillion Teemos");



function checkTSAchievementUnlocking(tsAchievement) {
    
	if(teemosSlain >= tsAchievement.unlockingReq){
        
        if(tsAchievement.unlocked===0){ // unlocking time
            notify("Achievement Unlocked!", tsAchievement.unlockingMessage, 5000, 120, 1000) 
        }
        
		tsAchievement.unlocked = 1;
	}
}

/*=======================================================================================================*/
/*=======================================================================================================*/

//champion level achievement object
function ChampionLevelAchievement(name, champion, levelReq, unlockingMessage) {
	this.name = name;
	this.champion = champion;
	this.levelReq = levelReq;
    this.unlockingMessage = unlockingMessage;
	
	this.unlocked = 0;
}

// build champion level achievements

// level 1 achievements
var ryzeFreeWeek = new ChampionLevelAchievement("ryzeFreeWeek", ryze, 1, "Ryze Free Rotation: level up Ryze to 1");
var dariusFreeWeek = new ChampionLevelAchievement("dariusFreeWeek", darius, 1, "Darius Free Rotation: level up Darius to 1");
var rumbleFreeWeek = new ChampionLevelAchievement("rumbleFreeWeek", rumble, 1, "Rumble Free Rotation: level up Rumble to 1");
var rivenFreeWeek = new ChampionLevelAchievement("rivenFreeWeek", riven, 1, "Riven Free Rotation: level up Riven to 1");
var syndraFreeWeek = new ChampionLevelAchievement("syndraFreeWeek", syndra, 1, "Syndra Free Rotation: level up Syndra to 1");
var pantheonFreeWeek = new ChampionLevelAchievement("pantheonFreeWeek", pantheon, 1, "Pantheon Free Rotation: level up Pantheon to 1");
var mordekaiserFreeWeek = new ChampionLevelAchievement("mordekaiserFreeWeek", mordekaiser, 1, "Mordekaiser Free Rotation: level up Mordekaiser to 1");
var leeSinFreeWeek = new ChampionLevelAchievement("leeSinFreeWeek", leeSin, 1, "Lee Sin Free Rotation: level up Lee Sin to 1");
var kassadinFreeWeek = new ChampionLevelAchievement("kassadinFreeWeek", kassadin, 1, "Kassadin Free Rotation: level up Kassadin to 1");
var zedFreeWeek = new ChampionLevelAchievement("zedFreeWeek", zed, 1, "Zed Free Rotation: level up Zed to 1");
var heimerdingerFreeWeek = new ChampionLevelAchievement("heimerdingerFreeWeek", heimerdinger, 1, "Heimerdinger Free Rotation: level up Heimerdinger to 1");
var dravenFreeWeek = new ChampionLevelAchievement("dravenFreeWeek", draven, 1, "Draven Free Rotation: level up Draven to 1");
var akaliFreeWeek = new ChampionLevelAchievement("akaliFreeWeek", akali, 1, "Akali Free Rotation: level up Akali to 1");
var aurelionSolFreeWeek = new ChampionLevelAchievement("aurelionSolFreeWeek", aurelionSol, 1, "Aurelion Sol Free Rotation: level up Aurelion Sol to 1");


// level 100 achievements
var ryzePlayer = new ChampionLevelAchievement("ryzePlayer", ryze, 100, "Ryze Player: level up Ryze to 100");
var dariusPlayer = new ChampionLevelAchievement("dariusPlayer", darius, 100, "Darius Player: level up Darius to 100");
var rumblePlayer = new ChampionLevelAchievement("rumblePlayer", rumble, 100, "Rumble Player: level up Rumble to 100");
var rivenPlayer = new ChampionLevelAchievement("rivenPlayer", riven, 100, "Riven Player: level up Riven to 100");
var syndraPlayer = new ChampionLevelAchievement("syndraPlayer", syndra, 100, "Syndra Player: level up Syndra to 100");
var pantheonPlayer = new ChampionLevelAchievement("pantheonPlayer", pantheon, 100, "Pantheon Player: level up Pantheon to 100");
var mordekaiserPlayer = new ChampionLevelAchievement("mordekaiserPlayer", mordekaiser, 100, "Mordekaiser Player: level up Mordekaiser to 100");
var leeSinPlayer = new ChampionLevelAchievement("leeSinPlayer", leeSin, 100, "Lee Sin Player: level up Lee Sin to 100");
var kassadinPlayer = new ChampionLevelAchievement("kassadinPlayer", kassadin, 100, "Kassadin Player: level up Kassadin to 100");
var zedPlayer = new ChampionLevelAchievement("zedPlayer", zed, 100, "Zed Player: level up Zed to 100");
var heimerdingerPlayer = new ChampionLevelAchievement("heimerdingerPlayer", heimerdinger, 100, "Heimerdinger Player: level up Heimerdinger to 100");
var dravenPlayer = new ChampionLevelAchievement("dravenPlayer", draven, 100, "Draven Player: level up Draven to 100");
var akaliPlayer = new ChampionLevelAchievement("akaliPlayer", akali, 100, "Akali Player: level up Akali to 100");
var aurelionSolPlayer = new ChampionLevelAchievement("aurelionSolPlayer", aurelionSol, 100, "Aurelion Sol Player: level up Aurelion Sol to 100");

function checkChampionLevelAchievementUnlocking (championLevelAchievement) {
    
	if(championLevelAchievement.champion.level >= championLevelAchievement.levelReq){
        
        if(championLevelAchievement.unlocked===0){ // unlocking time
            notify("Achievement Unlocked!", championLevelAchievement.unlockingMessage, 5000, 120, 1000)
        }
        
		championLevelAchievement.unlocked = 1;
        
	}
}

//this function must be called when Teemos are slain or champions are leveled up
function checkAchievementsUnlocked() {
	//TS achievements
	checkTSAchievementUnlocking(firstBlood);
	checkTSAchievementUnlocking(recruit);
	checkTSAchievementUnlocking(yordleHater);
	checkTSAchievementUnlocking(bronzeSlayer);
	checkTSAchievementUnlocking(silverSlayer);
	checkTSAchievementUnlocking(goldSlayer);
	checkTSAchievementUnlocking(platinumSlayer);
	checkTSAchievementUnlocking(diamondSlayer);
	checkTSAchievementUnlocking(challengerSlayer);
	
    //lvl 1 achievements
    checkChampionLevelAchievementUnlocking(ryzeFreeWeek);
	checkChampionLevelAchievementUnlocking(dariusFreeWeek);
	checkChampionLevelAchievementUnlocking(rumbleFreeWeek);
	checkChampionLevelAchievementUnlocking(rivenFreeWeek);
	checkChampionLevelAchievementUnlocking(syndraFreeWeek);
	checkChampionLevelAchievementUnlocking(pantheonFreeWeek);
	checkChampionLevelAchievementUnlocking(mordekaiserFreeWeek);
	checkChampionLevelAchievementUnlocking(leeSinFreeWeek);
	checkChampionLevelAchievementUnlocking(kassadinFreeWeek);
	checkChampionLevelAchievementUnlocking(zedFreeWeek);
	checkChampionLevelAchievementUnlocking(heimerdingerFreeWeek);
	checkChampionLevelAchievementUnlocking(dravenFreeWeek);
	checkChampionLevelAchievementUnlocking(akaliFreeWeek);
	checkChampionLevelAchievementUnlocking(aurelionSolFreeWeek);
	
    
	//lvl 100 achievements
	checkChampionLevelAchievementUnlocking(ryzePlayer);
	checkChampionLevelAchievementUnlocking(dariusPlayer);
	checkChampionLevelAchievementUnlocking(rumblePlayer);
	checkChampionLevelAchievementUnlocking(rivenPlayer);
	checkChampionLevelAchievementUnlocking(syndraPlayer);
	checkChampionLevelAchievementUnlocking(pantheonPlayer);
	checkChampionLevelAchievementUnlocking(mordekaiserPlayer);
	checkChampionLevelAchievementUnlocking(leeSinPlayer);
	checkChampionLevelAchievementUnlocking(kassadinPlayer);
	checkChampionLevelAchievementUnlocking(zedPlayer);
	checkChampionLevelAchievementUnlocking(heimerdingerPlayer);
	checkChampionLevelAchievementUnlocking(dravenPlayer);
	checkChampionLevelAchievementUnlocking(akaliPlayer);
	checkChampionLevelAchievementUnlocking(aurelionSolPlayer);
	
	updateAchievementInterface();
}

// Achievements interface

function updateChampionLevelAchievementInterface (championLevelAchievement) {
	if(championLevelAchievement.unlocked){
		document.getElementById(championLevelAchievement.name + "Description").style.display = "inline-block";
		document.getElementById(championLevelAchievement.name + "LockedDescription").style.display = "none";
		document.getElementById(championLevelAchievement.name).innerHTML = "<i style=\"color:orange\" class=\"fa fa-trophy fa-fw fa-3x\"></i>";
	}
}

function updateTSAchievementInterface(tsAchievement) {
	if(tsAchievement.unlocked){
		document.getElementById(tsAchievement.name + "Description").style.display = "inline-block";
		document.getElementById(tsAchievement.name + "LockedDescription").style.display = "none";
		document.getElementById(tsAchievement.name).innerHTML = "<i style=\"color:orange\" class=\"fa fa-trophy fa-fw fa-3x\"></i>";
	}
}


var numofUnlockedAchievements = 0;
var numofAllAchievements = 37; // dynamic way to calculate this?
function updateAchievementInterface() {
	//Show unlocked achievements
	//TS achievements
	updateTSAchievementInterface(firstBlood); 
	updateTSAchievementInterface(recruit);
	updateTSAchievementInterface(yordleHater);
	updateTSAchievementInterface(bronzeSlayer);
	updateTSAchievementInterface(silverSlayer);
	updateTSAchievementInterface(goldSlayer);
	updateTSAchievementInterface(platinumSlayer);
	updateTSAchievementInterface(diamondSlayer);
	updateTSAchievementInterface(challengerSlayer);
	
    //lvl 1 achievements  
    updateChampionLevelAchievementInterface(ryzeFreeWeek);
	updateChampionLevelAchievementInterface(dariusFreeWeek);
	updateChampionLevelAchievementInterface(rumbleFreeWeek);
	updateChampionLevelAchievementInterface(rivenFreeWeek);
	updateChampionLevelAchievementInterface(syndraFreeWeek);
	updateChampionLevelAchievementInterface(pantheonFreeWeek);
	updateChampionLevelAchievementInterface(mordekaiserFreeWeek);
	updateChampionLevelAchievementInterface(leeSinFreeWeek);
	updateChampionLevelAchievementInterface(kassadinFreeWeek);
	updateChampionLevelAchievementInterface(zedFreeWeek);
	updateChampionLevelAchievementInterface(heimerdingerFreeWeek);
	updateChampionLevelAchievementInterface(dravenFreeWeek);
	updateChampionLevelAchievementInterface(akaliFreeWeek);
	updateChampionLevelAchievementInterface(aurelionSolFreeWeek);
    
	//lvl 100 achievements
	updateChampionLevelAchievementInterface(ryzePlayer);
	updateChampionLevelAchievementInterface(dariusPlayer);
	updateChampionLevelAchievementInterface(rumblePlayer);
	updateChampionLevelAchievementInterface(rivenPlayer);
	updateChampionLevelAchievementInterface(syndraPlayer);
	updateChampionLevelAchievementInterface(pantheonPlayer);
	updateChampionLevelAchievementInterface(mordekaiserPlayer);
	updateChampionLevelAchievementInterface(leeSinPlayer);
	updateChampionLevelAchievementInterface(kassadinPlayer);
	updateChampionLevelAchievementInterface(zedPlayer);
	updateChampionLevelAchievementInterface(heimerdingerPlayer);
	updateChampionLevelAchievementInterface(dravenPlayer);
	updateChampionLevelAchievementInterface(akaliPlayer);
	updateChampionLevelAchievementInterface(aurelionSolPlayer);


	//Counts number of achievements unlocked
	//add TS achievements
	numofUnlockedAchievements = firstBlood.unlocked + recruit.unlocked + yordleHater.unlocked + bronzeSlayer.unlocked + silverSlayer.unlocked + goldSlayer.unlocked + platinumSlayer.unlocked + diamondSlayer.unlocked + challengerSlayer.unlocked;
	//add lvl 100 achievements
	numofUnlockedAchievements += ryzeFreeWeek.unlocked + ryzePlayer.unlocked + dariusFreeWeek.unlocked + dariusPlayer.unlocked + rumbleFreeWeek.unlocked + rumblePlayer.unlocked + rivenFreeWeek.unlocked + rivenPlayer.unlocked + syndraFreeWeek.unlocked + syndraPlayer.unlocked + pantheonFreeWeek.unlocked + pantheonPlayer.unlocked + mordekaiserFreeWeek.unlocked + mordekaiserPlayer.unlocked + leeSinFreeWeek.unlocked + leeSinPlayer.unlocked + kassadinFreeWeek.unlocked + kassadinPlayer.unlocked + zedFreeWeek.unlocked + zedPlayer.unlocked + heimerdingerFreeWeek.unlocked + heimerdingerPlayer.unlocked + dravenFreeWeek.unlocked + dravenPlayer.unlocked + akaliFreeWeek.unlocked + akaliPlayer.unlocked + aurelionSolFreeWeek.unlocked + aurelionSolPlayer.unlocked;
	
	document.getElementById("numofUnlockedAchievements").innerHTML = numofUnlockedAchievements;
	document.getElementById("numofAllAchievements").innerHTML = numofAllAchievements;
}

/*=====================================================
		SAVE
=====================================================*/

function save() {

	
	var save = {
		gold: gold,
		totalGoldGained: totalGoldGained,
		teemosSlain: teemosSlain,
		goldPerSecond: goldPerSecond,
		passiveChoice: passiveChoice,
		cursorHitPower: cursorHitPower,
		pastTeemosSlain: pastTeemosSlain,
		numberOfPoros: numberOfPoros,
		seasonCount: seasonCount,
        mainButtonTeemoPortrait: mainButtonTeemoPortrait,
		
		//champions
		ryzeLevel: ryze.level,
		dariusLevel: darius.level,
		rumbleLevel: rumble.level,
		rivenLevel: riven.level,
		syndraLevel: syndra.level,
		pantheonLevel: pantheon.level,
		mordekaiserLevel: mordekaiser.level,
		leeSinLevel: leeSin.level,
		kassadinLevel: kassadin.level,
		zedLevel: zed.level,
		heimerdingerLevel: heimerdinger.level,
		dravenLevel: draven.level,
		akaliLevel: akali.level,
		aurelionSolLevel: aurelionSol.level,
		
		//items
		doransBladeNumber: doransBlade.number,
		doransRingNumber: doransRing.number,
		brutalizerNumber: brutalizer.number,
		hauntingGuiseNumber: hauntingGuise.number,
		bloodthirsterNumber: bloodthirster.number,
		rabadonsDeathcapNumber: rabadonsDeathcap.number,
		phantomDancerNumber: phantomDancer.number,
		nashorsToothNumber: nashorsTooth.number,
		trinityForceNumber: trinityForce.number,
		ghostbladeNumber: ghostblade.number,
		infinityEdgeNumber: infinityEdge.number,
		lightbringerNumber: lightbringer.number,
		lastWhisperNumber: lastWhisper.number,
		voidStaffNumber: voidStaff.number,
		deathfireGraspNumber: deathfireGrasp.number,
		
		totalItemsOwned: totalItemsOwned,		
		maxItemsNumber: maxItemsNumber,
		itemBuild0: itemBuild[0],
		itemBuild1: itemBuild[1],
		itemBuild2: itemBuild[2],
		itemBuild3: itemBuild[3],
		itemBuild4: itemBuild[4],
		itemBuild5: itemBuild[5],
        
        // RYZE OVERLOAD
        ryzeOverloadEquipped: ryzeOverload.equipped,
        ryzeOverloadUnlocked: ryzeOverload.unlocked,
        ryzeOverloadCurrentCooldown: ryzeOverload.currentCooldown,
        
        // RIVEN BROKEN WINGS
        rivenBrokenWingsEquipped: rivenBrokenWings.equipped,
        rivenBrokenWingsUnlocked: rivenBrokenWings.unlocked,
        rivenBrokenWingsCurrentCooldown: rivenBrokenWings.currentCooldown,
        
        // MORDEKAISER CHILDREN OF THE GRAVE
        mordekaiserChildrenOfTheGraveEquipped: mordekaiserChildrenOfTheGrave.equipped,
        mordekaiserChildrenOfTheGraveUnlocked: mordekaiserChildrenOfTheGrave.unlocked,
        mordekaiserChildrenOfTheGraveCurrentCooldown: mordekaiserChildrenOfTheGrave.currentCooldown,
        
        // RYZE OVERLOAD
        zedDeathMarkEquipped: zedDeathMark.equipped,
        zedDeathMarkUnlocked: zedDeathMark.unlocked,
        zedDeathMarkCurrentCooldown: zedDeathMark.currentCooldown,
        
        
        // SPELLS BUILD
        spellsBuild0: spellsBuild[0],
        spellsBuild1: spellsBuild[1],
        spellsBuild2: spellsBuild[2],
        spellsBuild3: spellsBuild[3],
		
		//rip items
        ripItemsUnlocked: ripItemsUnlocked,
        bonetoothNecklaceNumber: bonetoothNecklace.number,
		heartOfGoldNumber: heartOfGold.number,
		philosophersStoneNumber: philosophersStone.number,
        
		
		//Skins (Teemo)
        
        classicTeemoOwned: classicTeemo.owned,
		reconTeemoOwned: reconTeemo.owned,
		cottontailTeemoOwned: cottontailTeemo.owned,
		astronautTeemoOwned: astronautTeemo.owned,
		superTeemoOwned: superTeemo.owned,
		badgerTeemoOwned: badgerTeemo.owned,
		pandaTeemoOwned: pandaTeemo.owned,
		omegaSquadTeemoOwned: omegaSquadTeemo.owned,
		
		
		//ChampionUpgrades
		ryzeUpgrade18Owned: ryzeUpgrade18.owned,
		dariusUpgrade18Owned: dariusUpgrade18.owned,
		rumbleUpgrade18Owned: rumbleUpgrade18.owned,
		rivenUpgrade18Owned: rivenUpgrade18.owned,
		syndraUpgrade18Owned: syndraUpgrade18.owned,
		pantheonUpgrade18Owned: pantheonUpgrade18.owned,
		mordekaiserUpgrade18Owned: mordekaiserUpgrade18.owned,
		leeSinUpgrade18Owned: leeSinUpgrade18.owned,
		kassadinUpgrade18Owned: kassadinUpgrade18.owned,
		zedUpgrade18Owned: zedUpgrade18.owned,
		heimerdingerUpgrade18Owned: heimerdingerUpgrade18.owned,
		dravenUpgrade18Owned: dravenUpgrade18.owned,
		akaliUpgrade18Owned: akaliUpgrade18.owned,
		aurelionSolUpgrade18Owned: aurelionSolUpgrade18.owned,
		
        //active item spells
        
        
		//item cooldowns
		spellBladeCooldown: spellBladeCooldown,
		frenzyCooldown: frenzyCooldown,
		doomCooldown: doomCooldown,
        
        
        // achievements
        
        //ts achievements
        firstBloodUnlocked : firstBlood.unlocked,
		recruitUnlocked : recruit.unlocked,
		yordleHaterUnlocked : yordleHater.unlocked,
		bronzeSlayerUnlocked : bronzeSlayer.unlocked,
		silverSlayerUnlocked : silverSlayer.unlocked,
		goldSlayerUnlocked : goldSlayer.unlocked,
		platinumSlayerUnlocked : platinumSlayer.unlocked,
		diamondSlayerUnlocked : diamondSlayer.unlocked,
		challengerSlayerUnlocked : challengerSlayer.unlocked,
		
        //lvl1 achievements
        ryzeFreeWeekUnlocked : ryzeFreeWeek.unlocked,
		dariusFreeWeekUnlocked : dariusFreeWeek.unlocked,
		rumbleFreeWeekUnlocked : rumbleFreeWeek.unlocked,
		rivenFreeWeekUnlocked : rivenFreeWeek.unlocked,
		syndraFreeWeekUnlocked : syndraFreeWeek.unlocked,
		pantheonFreeWeekUnlocked : pantheonFreeWeek.unlocked,
		mordekaiserFreeWeekUnlocked : mordekaiserFreeWeek.unlocked,
		leeSinFreeWeekUnlocked : leeSinFreeWeek.unlocked,
		kassadinFreeWeekUnlocked : kassadinFreeWeek.unlocked,
		zedFreeWeekUnlocked : zedFreeWeek.unlocked,
		heimerdingerFreeWeekUnlocked : heimerdingerFreeWeek.unlocked,
		dravenFreeWeekUnlocked : dravenFreeWeek.unlocked,
		akaliFreeWeekUnlocked : akaliFreeWeek.unlocked,
		aurelionSolFreeWeekUnlocked : aurelionSolFreeWeek.unlocked,
        
        //lvl100 achievements
		ryzePlayerUnlocked : ryzePlayer.unlocked,
		dariusPlayerUnlocked : dariusPlayer.unlocked,
		rumblePlayerUnlocked : rumblePlayer.unlocked,
		rivenPlayerUnlocked : rivenPlayer.unlocked,
		syndraPlayerUnlocked : syndraPlayer.unlocked,
		pantheonPlayerUnlocked : pantheonPlayer.unlocked,
		mordekaiserPlayerUnlocked : mordekaiserPlayer.unlocked,
		leeSinPlayerUnlocked : leeSinPlayer.unlocked,
		kassadinPlayerUnlocked : kassadinPlayer.unlocked,
		zedPlayerUnlocked : zedPlayer.unlocked,
		heimerdingerPlayerUnlocked : heimerdingerPlayer.unlocked,
		dravenPlayerUnlocked : dravenPlayer.unlocked,
		akaliPlayerUnlocked : akaliPlayer.unlocked,
		aurelionSolPlayerUnlocked : aurelionSolPlayer.unlocked
		
		
		
		
		
	}
	

	
	localStorage.setItem("save",JSON.stringify(save));
	
	console.log("game saved");
    
    notify("Game saved!", "", 600, 50, 400)
    attackSpeedCounter = 0;
    
};


function exportSave(){
	save();
	document.getElementById("exportandum").value = btoa(localStorage.getItem("save"));
}

function importSave(){
	var x = atob(document.getElementById("importandum").value);
	localStorage.setItem("save",x);
	load();
	location.reload();
	alert("Save loaded successfully!");
}

/*=====================================================
		LOAD & WIPE SAVE
=====================================================*/

function load(){
	var savegame = JSON.parse(localStorage.getItem("save"));
	if(savegame !== null){
	//BASE
	if (typeof savegame.gold !== "undefined") gold = savegame.gold;
	if (typeof savegame.totalGoldGained !== "undefined") totalGoldGained = savegame.totalGoldGained;
	if (typeof savegame.teemosSlain !== "undefined") teemosSlain = savegame.teemosSlain;
	if (typeof savegame.goldPerSecond !== "undefined") goldPerSecond = savegame.goldPerSecond;
	if (typeof savegame.passiveChoice !== "undefined") passiveChoice = savegame.passiveChoice;
	if (typeof savegame.cursorHitPower !== "undefined") cursorHitPower = savegame.cursorHitPower;
	if (typeof savegame.pastTeemosSlain !== "undefined") pastTeemosSlain = savegame.pastTeemosSlain;
	if (typeof savegame.numberOfPoros !== "undefined") numberOfPoros = savegame.numberOfPoros;
	if (typeof savegame.seasonCount !== "undefined") seasonCount = savegame.seasonCount;
	if (typeof savegame.mainButtonTeemoPortrait !== "undefined") mainButtonTeemoPortrait = savegame.mainButtonTeemoPortrait;
	
     updateMainButtonPortraitInterface();
        
	//Champions
	if (typeof savegame.ryzeLevel !== "undefined") ryze.level = savegame.ryzeLevel;
	if (typeof savegame.dariusLevel !== "undefined") darius.level = savegame.dariusLevel;
	if (typeof savegame.rumbleLevel !== "undefined") rumble.level = savegame.rumbleLevel;
	if (typeof savegame.rivenLevel !== "undefined") riven.level = savegame.rivenLevel;
	if (typeof savegame.syndraLevel !== "undefined") syndra.level = savegame.syndraLevel;
	if (typeof savegame.pantheonLevel !== "undefined") pantheon.level = savegame.pantheonLevel;
	if (typeof savegame.mordekaiserLevel !== "undefined") mordekaiser.level = savegame.mordekaiserLevel;
	if (typeof savegame.leeSinLevel !== "undefined") leeSin.level = savegame.leeSinLevel;
	if (typeof savegame.kassadinLevel !== "undefined") kassadin.level = savegame.kassadinLevel;
	if (typeof savegame.zedLevel !== "undefined") zed.level = savegame.zedLevel;
	if (typeof savegame.heimerdingerLevel !== "undefined") heimerdinger.level = savegame.heimerdingerLevel;
	if (typeof savegame.dravenLevel !== "undefined") draven.level = savegame.dravenLevel;
	if (typeof savegame.akaliLevel !== "undefined") akali.level = savegame.akaliLevel;
	if (typeof savegame.aurelionSolLevel !== "undefined") aurelionSol.level = savegame.aurelionSolLevel;
	
	//Items
	if (typeof savegame.doransBladeNumber !== "undefined") doransBlade.number = savegame.doransBladeNumber;
	if (typeof savegame.doransRingNumber !== "undefined") doransRing.number = savegame.doransRingNumber;
	if (typeof savegame.brutalizerNumber !== "undefined") brutalizer.number = savegame.brutalizerNumber;
	if (typeof savegame.hauntingGuiseNumber !== "undefined") hauntingGuise.number = savegame.hauntingGuiseNumber;
	if (typeof savegame.bloodthirsterNumber !== "undefined") bloodthirster.number = savegame.bloodthirsterNumber;
	if (typeof savegame.rabadonsDeathcapNumber !== "undefined") rabadonsDeathcap.number = savegame.rabadonsDeathcapNumber;
	if (typeof savegame.phantomDancerNumber !== "undefined") phantomDancer.number = savegame.phantomDancerNumber;
	if (typeof savegame.nashorsToothNumber !== "undefined") nashorsTooth.number = savegame.nashorsToothNumber;
	if (typeof savegame.trinityForceNumber !== "undefined") trinityForce.number = savegame.trinityForceNumber;
	if (typeof savegame.ghostbladeNumber !== "undefined") ghostblade.number = savegame.ghostbladeNumber;
	if (typeof savegame.infinityEdgeNumber !== "undefined") infinityEdge.number = savegame.infinityEdgeNumber;
	if (typeof savegame.lightbringerNumber !== "undefined") lightbringer.number = savegame.lightbringerNumber;
	if (typeof savegame.lastWhisperNumber !== "undefined") lastWhisper.number = savegame.lastWhisperNumber;
	if (typeof savegame.voidStaffNumber !== "undefined") voidStaff.number = savegame.voidStaffNumber;
	if (typeof savegame.deathfireGraspNumber !== "undefined") deathfireGrasp.number = savegame.deathfireGraspNumber;
        
        
	
	if (typeof savegame.maxItemsNumber !== "undefined") maxItemsNumber = savegame.maxItemsNumber;
	
	if (typeof savegame.itemBuild0 !== "undefined") itemBuild[0] = savegame.itemBuild0; 
	if (typeof savegame.itemBuild1 !== "undefined") itemBuild[1] = savegame.itemBuild1;
	if (typeof savegame.itemBuild2 !== "undefined") itemBuild[2] = savegame.itemBuild2;
	if (typeof savegame.itemBuild3 !== "undefined")	itemBuild[3] = savegame.itemBuild3;
	if (typeof savegame.itemBuild4 !== "undefined") itemBuild[4] = savegame.itemBuild4;
	if (typeof savegame.itemBuild5 !== "undefined") itemBuild[5] = savegame.itemBuild5;
      
    // ryze overload  
    if (typeof savegame.ryzeOverloadUnlocked !== "undefined") ryzeOverload.unlocked = savegame.ryzeOverloadUnlocked;
    if (typeof savegame.ryzeOverloadEquipped !== "undefined") ryzeOverload.equipped = savegame.ryzeOverloadEquipped;
    if (typeof savegame.ryzeOverloadCurrentCooldown !== "undefined") ryzeOverload.currentCooldown = savegame.ryzeOverloadCurrentCooldown;
    
    // riven broken wings
    if (typeof savegame.rivenBrokenWingsUnlocked !== "undefined") rivenBrokenWings.unlocked = savegame.rivenBrokenWingsUnlocked;
    if (typeof savegame.rivenBrokenWingsEquipped !== "undefined") rivenBrokenWings.equipped = savegame.rivenBrokenWingsEquipped;
    if (typeof savegame.rivenBrokenWingsCurrentCooldown !== "undefined") rivenBrokenWings.currentCooldown = savegame.rivenBrokenWingsCurrentCooldown;
        
    // mordekaiser children of the grave
    if (typeof savegame.mordekaiserChildrenOfTheGraveUnlocked !== "undefined") mordekaiserChildrenOfTheGrave.unlocked = savegame.mordekaiserChildrenOfTheGraveUnlocked;
    if (typeof savegame.mordekaiserChildrenOfTheGraveEquipped !== "undefined") mordekaiserChildrenOfTheGrave.equipped = savegame.mordekaiserChildrenOfTheGraveEquipped;
    if (typeof savegame.mordekaiserChildrenOfTheGraveCurrentCooldown !== "undefined") mordekaiserChildrenOfTheGrave.currentCooldown = savegame.mordekaiserChildrenOfTheGraveCurrentCooldown;
     
    // zed death mark
    if (typeof savegame.zedDeathMarkUnlocked !== "undefined") zedDeathMark.unlocked = savegame.zedDeathMarkUnlocked;
    if (typeof savegame.zedDeathMarkEquipped !== "undefined") zedDeathMark.equipped = savegame.zedDeathMarkEquipped;
    if (typeof savegame.zedDeathMarkCurrentCooldown !== "undefined") zedDeathMark.currentCooldown = savegame.zedDeathMarkCurrentCooldown;
        
    // spells build
	if (typeof savegame.spellsBuild0 !== "undefined") spellsBuild[0] = savegame.spellsBuild0;
	if (typeof savegame.spellsBuild1 !== "undefined") spellsBuild[1] = savegame.spellsBuild1;
	if (typeof savegame.spellsBuild2 !== "undefined") spellsBuild[2] = savegame.spellsBuild2;
	if (typeof savegame.spellsBuild3 !== "undefined") spellsBuild[3] = savegame.spellsBuild3;
	
	//RIP items
    if (typeof ripItemsUnlocked !== "undefined") ripItemsUnlocked = savegame.ripItemsUnlocked;
    if (typeof savegame.bonetoothNecklaceNumber !== "undefined") bonetoothNecklace.number = savegame.bonetoothNecklaceNumber;
	if (typeof savegame.heartOfGoldNumber !== "undefined") heartOfGold.number = savegame.heartOfGoldNumber;
	if (typeof savegame.philosophersStoneNumber !== "undefined") philosophersStone.number = savegame.philosophersStoneNumber;
	
	//Skins (Teemo)
	if (typeof savegame.classicTeemoOwned !== "undefined") classicTeemo.owned = savegame.classicTeemoOwned;
	if (typeof savegame.reconTeemoOwned !== "undefined") reconTeemo.owned = savegame.reconTeemoOwned;
	if (typeof savegame.cottontailTeemoOwned !== "undefined") cottontailTeemo.owned = savegame.cottontailTeemoOwned;
	if (typeof savegame.astronautTeemoOwned !== "undefined") astronautTeemo.owned = savegame.astronautTeemoOwned;
	if (typeof savegame.superTeemoOwned !== "undefined") superTeemo.owned = savegame.superTeemoOwned;
	if (typeof savegame.badgerTeemoOwned !== "undefined") badgerTeemo.owned = savegame.badgerTeemoOwned;
	if (typeof savegame.pandaTeemoOwned !== "undefined") pandaTeemo.owned = savegame.pandaTeemoOwned;
	if (typeof savegame.omegaSquadTeemoOwned !== "undefined") omegaSquadTeemo.owned = savegame.omegaSquadTeemoOwned;
	
	
	//Champion Upgrades
	if (typeof savegame.ryzeUpgrade18Owned !== "undefined"){
		ryzeUpgrade18.owned = savegame.ryzeUpgrade18Owned;
		ryze.upgrade18Owned = savegame.ryzeUpgrade18Owned;
	}
	if (typeof savegame.dariusUpgrade18Owned !== "undefined"){
		dariusUpgrade18.owned = savegame.dariusUpgrade18Owned;
		darius.upgrade18Owned = savegame.dariusUpgrade18Owned;
	}
	if (typeof savegame.rumbleUpgrade18Owned !== "undefined"){
	rumbleUpgrade18.owned = savegame.rumbleUpgrade18Owned;
	rumble.upgrade18Owned = savegame.rumbleUpgrade18Owned;
	}
	if (typeof savegame.rivenUpgrade18Owned !== "undefined"){
	rivenUpgrade18.owned = savegame.rivenUpgrade18Owned;
	riven.upgrade18Owned = savegame.rivenUpgrade18Owned;
	}
	if (typeof savegame.syndraUpgrade18Owned !== "undefined"){
	syndraUpgrade18.owned = savegame.syndraUpgrade18Owned;
	syndra.upgrade18Owned = savegame.syndraUpgrade18Owned;
	}
	if (typeof savegame.pantheonUpgrade18Owned !== "undefined"){
	pantheonUpgrade18.owned = savegame.pantheonUpgrade18Owned;
	pantheon.upgrade18Owned = savegame.pantheonUpgrade18Owned;
	}
	if (typeof savegame.mordekaiserUpgrade18Owned !== "undefined"){
	mordekaiserUpgrade18.owned = savegame.mordekaiserUpgrade18Owned;
	mordekaiser.upgrade18Owned = savegame.mordekaiserUpgrade18Owned;
	}
	if (typeof savegame.leeSinUpgrade18Owned !== "undefined"){
	leeSinUpgrade18.owned = savegame.leeSinUpgrade18Owned;
	leeSin.upgrade18Owned = savegame.leeSinUpgrade18Owned;
	}
	if (typeof savegame.kassadinUpgrade18Owned !== "undefined"){
	kassadinUpgrade18.owned = savegame.kassadinUpgrade18Owned;
	kassadin.upgrade18Owned = savegame.kassadinUpgrade18Owned;
	}
	if (typeof savegame.zedUpgrade18Owned !== "undefined"){
	zedUpgrade18.owned = savegame.zedUpgrade18Owned;
	zed.upgrade18Owned = savegame.zedUpgrade18Owned;
	}
	if (typeof savegame.heimerdingerUpgrade18Owned !== "undefined"){
	heimerdingerUpgrade18.owned = savegame.heimerdingerUpgrade18Owned;
	heimerdinger.upgrade18Owned = savegame.heimerdingerUpgrade18Owned;
	}
	if (typeof savegame.dravenUpgrade18Owned !== "undefined"){
	dravenUpgrade18.owned = savegame.dravenUpgrade18Owned;
	draven.upgrade18Owned = savegame.dravenUpgrade18Owned;
	}
	if (typeof savegame.akaliUpgrade18Owned !== "undefined"){
		akaliUpgrade18.owned = savegame.akaliUpgrade18Owned;
		akali.upgrade18Owned = savegame.akaliUpgrade18Owned;
	}
	if (typeof savegame.aurelionSolUpgrade18Owned !== "undefined"){
		aurelionSolUpgrade18.owned = savegame.aurelionSolUpgrade18Owned;
		aurelionSol.upgrade18Owned = savegame.aurelionSolUpgrade18Owned;
	}
	
	//Cooldowns
	if (typeof savegame.spellBladeCooldown !== "undefined") spellBladeCooldown = savegame.spellBladeCooldown;
	if (typeof savegame.frenzyCooldown !== "undefined") frenzyCooldown = savegame.frenzyCooldown;
	if (typeof savegame.doomCooldown !== "undefined") doomCooldown = savegame.doomCooldown;
	
    // Achievements
        
    // ts achievements
    if (typeof savegame.firstBloodUnlocked !== "undefined") firstBlood.unlocked = savegame.firstBloodUnlocked;
    if (typeof savegame.recruitUnlocked !== "undefined") recruit.unlocked = savegame.recruitUnlocked;
    if (typeof savegame.yordleHaterUnlocked !== "undefined") yordleHater.unlocked = savegame.yordleHaterUnlocked; 
    if (typeof savegame.bronzeSlayerUnlocked !== "undefined") bronzeSlayer.unlocked = savegame.bronzeSlayerUnlocked;     
    if (typeof savegame.silverSlayerUnlocked !== "undefined") silverSlayer.unlocked = savegame.silverSlayerUnlocked;     
    if (typeof savegame.goldSlayerUnlocked !== "undefined") goldSlayer.unlocked = savegame.goldSlayerUnlocked;     
    if (typeof savegame.platinumSlayerUnlocked !== "undefined") platinumSlayer.unlocked = savegame.platinumSlayerUnlocked;     
    if (typeof savegame.diamondSlayerUnlocked !== "undefined") diamondSlayer.unlocked = savegame.diamondSlayerUnlocked;     
    if (typeof savegame.challengerSlayerUnlocked !== "undefined") challengerSlayer.unlocked = savegame.challengerSlayerUnlocked;   
        
    // lvl 1 achievements
    if (typeof savegame.ryzeFreeWeekUnlocked !== "undefined") ryzeFreeWeek.unlocked = savegame.ryzeFreeWeekUnlocked;     
    if (typeof savegame.dariusFreeWeekUnlocked !== "undefined") dariusFreeWeek.unlocked = savegame.dariusFreeWeekUnlocked;     
    if (typeof savegame.rumbleFreeWeekUnlocked !== "undefined") rumbleFreeWeek.unlocked = savegame.rumbleFreeWeekUnlocked;     
    if (typeof savegame.rivenFreeWeekUnlocked !== "undefined") rivenFreeWeek.unlocked = savegame.rivenFreeWeekUnlocked;     
    if (typeof savegame.syndraFreeWeekUnlocked !== "undefined") syndraFreeWeek.unlocked = savegame.syndraFreeWeekUnlocked;     
    if (typeof savegame.pantheonFreeWeekUnlocked !== "undefined") pantheonFreeWeek.unlocked = savegame.pantheonFreeWeekUnlocked;     
    if (typeof savegame.mordekaiserFreeWeekUnlocked !== "undefined") mordekaiserFreeWeek.unlocked = savegame.mordekaiserFreeWeekUnlocked;     
    if (typeof savegame.leeSinFreeWeekUnlocked !== "undefined") leeSinFreeWeek.unlocked = savegame.leeSinFreeWeekUnlocked;     
    if (typeof savegame.kassadinFreeWeekUnlocked !== "undefined") kassadinFreeWeek.unlocked = savegame.kassadinFreeWeekUnlocked;     
    if (typeof savegame.zedFreeWeekUnlocked !== "undefined") zedFreeWeek.unlocked = savegame.zedFreeWeekUnlocked;     
    if (typeof savegame.heimerdingerFreeWeekUnlocked !== "undefined") heimerdingerFreeWeek.unlocked = savegame.heimerdingerFreeWeekUnlocked;     
    if (typeof savegame.dravenFreeWeekUnlocked !== "undefined") dravenFreeWeek.unlocked = savegame.dravenFreeWeekUnlocked;     
    if (typeof savegame.akaliFreeWeekUnlocked !== "undefined") akaliFreeWeek.unlocked = savegame.akaliFreeWeekUnlocked;     
    if (typeof savegame.aurelionSolFreeWeekUnlocked !== "undefined") aurelionSolFreeWeek.unlocked = savegame.aurelionSolFreeWeekUnlocked;  
        
    // lvl 100 achievements    
    if (typeof savegame.ryzePlayerUnlocked !== "undefined") ryzePlayer.unlocked = savegame.ryzePlayerUnlocked;     
    if (typeof savegame.dariusPlayerUnlocked !== "undefined") dariusPlayer.unlocked = savegame.dariusPlayerUnlocked;     
    if (typeof savegame.rumblePlayerUnlocked !== "undefined") rumblePlayer.unlocked = savegame.rumblePlayerUnlocked;     
    if (typeof savegame.rivenPlayerUnlocked !== "undefined") rivenPlayer.unlocked = savegame.rivenPlayerUnlocked;     
    if (typeof savegame.syndraPlayerUnlocked !== "undefined") syndraPlayer.unlocked = savegame.syndraPlayerUnlocked;     
    if (typeof savegame.pantheonPlayerUnlocked !== "undefined") pantheonPlayer.unlocked = savegame.pantheonPlayerUnlocked;     
    if (typeof savegame.mordekaiserPlayerUnlocked !== "undefined") mordekaiserPlayer.unlocked = savegame.mordekaiserPlayerUnlocked;     
    if (typeof savegame.leeSinPlayerUnlocked !== "undefined") leeSinPlayer.unlocked = savegame.leeSinPlayerUnlocked;     
    if (typeof savegame.kassadinPlayerUnlocked !== "undefined") kassadinPlayer.unlocked = savegame.kassadinPlayerUnlocked;     
    if (typeof savegame.zedPlayerUnlocked !== "undefined") zedPlayer.unlocked = savegame.zedPlayerUnlocked;     
    if (typeof savegame.heimerdingerPlayerUnlocked !== "undefined") heimerdingerPlayer.unlocked = savegame.heimerdingerPlayerUnlocked;     
    if (typeof savegame.dravenPlayerUnlocked !== "undefined") dravenPlayer.unlocked = savegame.dravenPlayerUnlocked;     
    if (typeof savegame.akaliPlayerUnlocked !== "undefined") akaliPlayer.unlocked = savegame.akaliPlayerUnlocked;     
    if (typeof savegame.aurelionSolPlayerUnlocked !== "undefined") aurelionSolPlayer.unlocked = savegame.aurelionSolPlayerUnlocked;     
   
    
    if(allTimeTeemosSlain>= urfTeemosSlainRequirement){
		document.getElementById("urfChoice").style.display = "block";
    }
        
	if(passiveChoice !== 0){
        document.getElementById("chooseYourPassive").style.display = 'none';
        setPassive(passiveChoice);
    } 
        

    updateAchievementInterface();
    updateMusclesLevel();
    computeGoldPerSecond();
	updateTotalItemsOwned();
    updateTotalSpellsEquipped();
	computePlayerStats();
	showHideItemSpells();
	showChampionsUpgrades();
    showChampionSpellsBlocks();
    computeCursorHitPower(); 
	updateInterface();
    updateDisplayedInventory();
    updateDisplayedSpellsInventory();




	}
};

function wipeSave(){
	if(confirm("All your progress will be lost.")){
		localStorage.removeItem("save");
		location.reload();
	}
	
	console.log("wipe completed");
};


/*=====================================================
		RESET FEATURE
=====================================================*/

function resetGame() { // END SEASON
    var totalTeemosSlain = pastTeemosSlain + teemosSlain;
    var newNumberOfPoros = Math.round(Math.pow((totalTeemosSlain/1000000),1/4));
    var oldNumberOfPoros = Math.round(Math.pow((pastTeemosSlain/1000000),1/4));
    var porosDifferential = newNumberOfPoros - oldNumberOfPoros
	if(confirm("You will restart from scratch, but keeping the achievements you unlocked. You will recieve " + porosDifferential + " new poros (GpS bonus) fighting by your side.")){
	
		//rewards
		var temp = pastTeemosSlain + teemosSlain;
		var displayUrfUnlocked = false;  // display the message
		
		numberOfPoros = Math.round(Math.pow((temp/1000000),1/4));
		document.getElementById("displayedNumberOfPoros").innerHTML = numberOfPoros;
	
		//Clears champions and their upgrades
		ryze.level = 0;
		ryzeUpgrade18.owned = 0;
		ryze.upgrade18Owned = 0;
		
		darius.level = 0;
		dariusUpgrade18.owned = 0;
		darius.upgrade18Owned = 0;
		
		rumble.level = 0;
		rumbleUpgrade18.owned = 0;
		rumble.upgrade18Owned = 0;
		
		riven.level = 0;
		rivenUpgrade18.owned = 0;
		riven.upgrade18Owned = 0;
		
		syndra.level = 0;
		syndraUpgrade18.owned = 0;
		syndra.upgrade18Owned = 0;
		
		pantheon.level = 0;
		pantheonUpgrade18.owned = 0;
		pantheon.upgrade18Owned = 0;
		
		mordekaiser.level = 0;
		mordekaiserUpgrade18.owned = 0;
		mordekaiser.upgrade18Owned = 0;
		
		leeSin.level = 0;
		leeSinUpgrade18.owned = 0;
		leeSin.upgrade18Owned = 0;
		
		kassadin.level = 0;
		kassadinUpgrade18.owned = 0;
		kassadin.upgrade18Owned = 0;
		
		zed.level = 0;
		zedUpgrade18.owned = 0;
		zed.upgrade18Owned = 0;
		
		heimerdinger.level = 0;
		heimerdingerUpgrade18.owned = 0;
		heimerdinger.upgrade18Owned = 0;
		
		draven.level = 0;
		dravenUpgrade18.owned = 0;
		draven.upgrade18Owned = 0;
		
		akali.level = 0;
		akaliUpgrade18.owned = 0;
		akali.upgrade18Owned = 0;
		
		aurelionSol.level = 0;
		aurelionSolUpgrade18.owned = 0;
		aurelionSol.upgrade18Owned = 0;
		
		//Clears inventory
		for(i=0;i<=6;i++){
			sellItem(doransBlade);
			sellItem(doransRing);
			sellItem(brutalizer);
			sellItem(hauntingGuise);
			sellItem(lightbringer);
			sellItem(lastWhisper);
			sellItem(voidStaff);
			sellItem(bloodthirster);
			sellItem(rabadonsDeathcap);
			sellItem(phantomDancer);
			sellItem(nashorsTooth);
			sellItem(trinityForce);
			sellItem(ghostblade);
			sellItem(infinityEdge);
			sellItem(deathfireGrasp);
		}
        
        unequipChampionSpell(ryzeOverload);
        unequipChampionSpell(rivenBrokenWings);
        unequipChampionSpell(mordekaiserChildrenOfTheGrave);
        unequipChampionSpell(zedDeathMark);
		
        bonetoothNecklace.number = 0;
		heartOfGold.number = 0;
		philosophersStone.number = 0;
		
		//skins
        mainButtonTeemoPortrait = "files/teemoPortraits/teemo_face.jpg";
        updateMainButtonPortraitInterface();
        document.getElementById("unequipSkinsButton").style.display = "none";
        
        classicTeemo.owned = 0;
		reconTeemo.owned = 0;
		cottontailTeemo.owned = 0;
		astronautTeemo.owned = 0;
		superTeemo.owned = 0;
		badgerTeemo.owned = 0;
		pandaTeemo.owned = 0;
		omegaSquadTeemo.owned = 0;
		
		
		//TeemosSlain
		if(pastTeemosSlain < urfTeemosSlainRequirement && pastTeemosSlain + teemosSlain >= urfTeemosSlainRequirement){
			displayUrfUnlocked = true;
		}
		pastTeemosSlain = pastTeemosSlain + teemosSlain;
		totalGoldGained = 0;
		teemosSlain = 0;
		
		//basic
		
		gold = 0;
//		setPassive(0);
        passiveChoice = 0;
		seasonCount++;
		
		//interface
		showChampionsUpgrades();
        showChampionSpellsBlocks();
		checkTeemoSkinsUnlocking();
		document.getElementById("chooseYourPassive").style.display = 'block';
		openTab(0);
		updateInterface();
		
		
		if(allTimeTeemosSlain>=urfTeemosSlainRequirement){
		document.getElementById("urfChoice").style.display = "block";
		}	
		
		//end of reset message
		if(displayUrfUnlocked){
		alert("You have unlocked a new passive, and " + numberOfPoros + " Poros are fighting by your side!");
		}
		else{
		alert(numberOfPoros + " Poros are fighting by your side!");
		}
        
		save();
        load();
		
	}

};


/*=====================================================
		GAME LOOP
=====================================================*/



// gold gain fast loop
/*
THIS CAUSES A MAJOR BUG: WORKS FINE WHEN I LOSE FOCUS BY GOING TO ANOTHER TAB
BUT WHEN I SWITCH TO ANOTHER APP (NOT THE BROWSER), document.hasFocus is true,
and the gps is as such multiplied by 20. how to remove this?

window.setInterval(function(){
	testGainGold(goldPerSecond);
	
}, 1000/goldGainLoopDivision)
*/


// gold gain fast loop
window.setInterval(function(){
	gainGold(goldPerSecond)
	
}, 1000)

// notifications loop
window.setInterval(function(){
    processNotificationsArray();
}, 50)


// until I solve the problem (changing web page resulting in slower gold generation), interval is set to 1000ms (which eliminates the problem)
window.setInterval(function(){

	computeGoldPerSecond();
	teemosSlain = Math.floor(totalGoldGained/300);
	allTimeTeemosSlain = teemosSlain + pastTeemosSlain;
	
	//all of the below depend  on # of teemos slain
	updateMusclesLevel ();
	computeTeemoResistance();
	
	checkTeemoSkinsUnlocking(); //checks if teemosSkins are unlocked
	checkRipTierUnlocking();
	
	checkAchievementsUnlocked();
	
}, 1000)




// this allows for non integer gold generation to be counted
window.setInterval(function(){
	
	roundGold = Math.floor(gold);
	updateInterface();
	
}, 30)


//autosaves every 1/2 minute
window.setInterval(function(){
	
	save();
	
}, 30000)


//Items passives/actives cooldowns loop
window.setInterval(function(){
	if(trinityForce.owned()){
		if(spellBladeOnCooldown()){
			spellBladeCooldown = Math.floor(spellBladeCooldown - 1);
			document.getElementById("spellBladeCooldown").innerHTML = addCommas(spellBladeCooldown);
			document.getElementById("spellBladeCooldown").style.color = "orange";
			
		}
	
		else{
			document.getElementById("spellBladeCooldown").style.color = "green";
			document.getElementById("spellBladeActive").style.display = 'inline-block';
			
		}
		
	}
	
	if(ghostblade.owned()){
		if(frenzyOnCooldown()){
			frenzyCooldown =  Math.floor(frenzyCooldown - 1);
			document.getElementById("frenzyCooldown").innerHTML = addCommas(frenzyCooldown);
			document.getElementById("frenzyCooldown").style.color = "orange";
		}
	
		else{
			document.getElementById("frenzyCooldown").style.color = "green";
		}
	}
	
	if(deathfireGrasp.owned()){
		if(doomOnCooldown()){
			doomCooldown =  Math.floor(doomCooldown - 1);
			document.getElementById("doomCooldown").innerHTML = addCommas(doomCooldown);
			document.getElementById("doomCooldown").style.color = "orange";
		}
	
		else{
			document.getElementById("doomCooldown").style.color = "green";
		}
	}
	
    updateDisplayedInventory()
	
}, 1000)


// attack speed - test v1.0: every x milliseconds, hit teemo


var attackSpeedCounter = 0
window.setInterval(function(){
    
    // basic counting and looping
    attackSpeedCounter = attackSpeedCounter + 1
    if(attackSpeedCounter >= 14) attackSpeedCounter = 0
    
    
    // attack speed
    if(attackSpeedCounter >= 15/(1 + globalAttackSpeed)){
        hitTeemo(cursorHitPower)
        attackSpeedCounter = 0
    }
	
}, 1000)



//BIG BLUE WATERY ROAD - SCRAPPED
/*
window.setInterval(function(){
	
	if(passiveChoice === 4){
	wateryRoadLevel++;
	document.getElementById("wateryRoadDisplayedStacks").innerHTML = wateryRoadLevel + "%";
	}
	
}, 3600000)
*/
