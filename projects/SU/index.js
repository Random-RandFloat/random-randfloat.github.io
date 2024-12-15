var items = {
    "Hand": {
        "Type": "Interaction",
        "Info": "Your hands, they are quite handy.",
        "CritChance": 1,
        "DMG": [5, 10],
        "HitDialog": "You punch OP!"
    },
    "Knife": {
        "Type": "Tool",
        "Info": "An old switch blade. The blade is rusted and somewhat dull.",
        "DMG": [15, 20],
        "CritChance": 5,
        "HitDialog": "You stab OP!"
    },
    "Medicine": {
        "Type": "Medical",
        "Heal": 10,
        "Info": "An orange translucent container with medicine inside, it's missing the label. Might not be the smartest to use. Heals 10%"
    },
    "Crowbar": {
        "Type": "Tool",
        "Info": "Doesn't take a degree in theoretical physics to use.",
        "DMG": [10, 15],
        "CritChance": 20,
        "HitDialog": "You hit OP!"
    },
    "Hall Key": {
        "Type": "Key",
        "Info": "A rusty old key, specs of blood are on the end, what happened?",
        "DMG": [1, 5],
        "CritChance": 0,
        "HitDialog": "You manage to shank OP with the key! It wasn't very effective"
    },
    "Flashlight": {
        "Type": "Tool",
        "Info": "A flashlight with batteries included. This really illuminates your day.",
        "DMG": [1, 2],
        "CritChance": 0,
        "HitDialog": "You give OP blunt force trauma!"
    }
};
var throwAwayDialog = [
    "You threw away the ITEM.",
    "You dropped the ITEM.",
    "You abandoned the ITEM.",
    "The threw away the ITEM like the trash it is."
];
var lostAndFound = [];
var inventory = {
    "Hand": 2
};
var selected_item = "Hand";
var map = {};
var current_location = "0,0";
fetch("map.json").then(function (res) { return res.json(); }).then(function (json) {
    map = json;
    getLocationInfo();
    updateActions();
    updateStatusInfo();
});
function updateStatusInfo() {
    document.querySelector("#location-indicator").textContent = map[current_location]["Name"];
}
function updateActions() {
    if (map[current_location]["Directions"]["North"] != "Open") {
        document.querySelector("#go-north").setAttribute("disabled", "true");
    }
    else {
        document.querySelector("#go-north").removeAttribute("disabled");
    }
    if (map[current_location]["Directions"]["East"] != "Open") {
        document.querySelector("#go-east").setAttribute("disabled", "true");
    }
    else {
        document.querySelector("#go-east").removeAttribute("disabled");
    }
    if (map[current_location]["Directions"]["West"] != "Open") {
        document.querySelector("#go-west").setAttribute("disabled", "true");
    }
    else {
        document.querySelector("#go-west").removeAttribute("disabled");
    }
    if (map[current_location]["Directions"]["South"] != "Open") {
        document.querySelector("#go-south").setAttribute("disabled", "true");
    }
    else {
        document.querySelector("#go-south").removeAttribute("disabled");
    }
}
function refreshItems() {
    var item_list = document.querySelector("#item-list");
    while (item_list.firstChild)
        item_list.removeChild(item_list.firstChild);
    var _loop_1 = function (item) {
        if (Object.prototype.hasOwnProperty.call(inventory, item)) {
            var item_id_1 = item;
            var item_count = inventory[item];
            var item_type = items[item]["Type"];
            var tr = document.createElement("tr");
            if (item_id_1 === selected_item)
                tr.classList.add("highlighted");
            tr.onclick = function () {
                selected_item = item_id_1;
                refreshItems();
            };
            var name_1 = tr.appendChild(document.createElement("td"));
            name_1.textContent = item;
            var count = tr.appendChild(document.createElement("td"));
            count.textContent = item_count;
            var type = tr.appendChild(document.createElement("td"));
            type.textContent = item_type;
            item_list.appendChild(tr);
        }
    };
    for (var item in inventory) {
        _loop_1(item);
    }
}
refreshItems();
function setInfoText(text) {
    var info_text = document.querySelector("#info-text");
    info_text.textContent = text;
}
function getItemInfo() {
    setInfoText(items[selected_item]["Info"]);
}
function discardItem() {
    if (selected_item == "Hand") {
        setInfoText("How do you exactly plan to do that... and why?");
        return;
    }
    setInfoText(throwAwayDialog[Math.floor(Math.random() * throwAwayDialog.length)].replace("ITEM", selected_item));
    inventory[selected_item]--;
    lostAndFound.push(selected_item);
    if (inventory[selected_item] <= 0) {
        delete inventory[selected_item];
        selected_item = "Hand";
    }
    refreshItems();
}
function useItem() {
    if (current_opponent) {
        useItemInBattle();
        return;
    }
    if (map[current_location]["Events"] && map[current_location]["Events"]["UseItem"] && map[current_location]["Events"]["UseItem"][selected_item]) {
        map[current_location]["Events"]["UseItem"][selected_item].forEach(function (action) {
            doGameAction(action);
        });
    }
    else {
        setInfoText("There's nothing to use that on here.");
    }
}
function getLocationInfo() {
    setInfoText(map[current_location]["Info"]);
}
function getCoords(elem) {
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;
    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    return { top: Math.round(top), left: Math.round(left) };
}
document.querySelectorAll(".window").forEach(function (fake_window) {
    var titlebar = fake_window.querySelector(".title-bar");
    var dragging = false;
    var dragging_offset = [0, 0];
    fake_window.addEventListener("mousedown", function (e) {
        fake_window.parentElement.appendChild(fake_window);
    });
    fake_window["style"]["top"] = getCoords(fake_window)["top"] + "px";
    fake_window["style"]["left"] = getCoords(fake_window)["left"] + "px";
    fake_window["style"]["margin"] = "0";
    fake_window["style"]["transform"] = "translate(0px, 0px)";
    fake_window["style"]["position"] = "absolute";
    titlebar.addEventListener("mousedown", function (e) {
        dragging = true;
        dragging_offset = [e.offsetX + 3, e.offsetY + 3];
    });
    document.addEventListener("mousemove", function (e) {
        if (dragging) {
            fake_window["style"]["margin"] = "0";
            fake_window["style"]["transform"] = "translate(0px, 0px)";
            fake_window["style"]["position"] = "absolute";
            fake_window["style"]["top"] = (e.clientY - dragging_offset[1]) + "px";
            fake_window["style"]["left"] = (e.clientX - dragging_offset[0]) + "px";
        }
    });
    document.addEventListener("mouseup", function (e) {
        dragging = false;
    });
});
function goNorth() {
    var cur_pos = current_location.split(",");
    cur_pos[1] = (parseInt(cur_pos[1]) + 1).toString();
    current_location = cur_pos.join(",");
    setInfoText("You walk north.");
    updateActions();
    updateStatusInfo();
    roomEntered();
}
function goEast() {
    var cur_pos = current_location.split(",");
    cur_pos[0] = (parseInt(cur_pos[0]) + 1).toString();
    current_location = cur_pos.join(",");
    setInfoText("You walk east.");
    updateActions();
    updateStatusInfo();
    roomEntered();
}
function goSouth() {
    var cur_pos = current_location.split(",");
    cur_pos[1] = (parseInt(cur_pos[1]) - 1).toString();
    current_location = cur_pos.join(",");
    setInfoText("You walk south.");
    updateActions();
    updateStatusInfo();
    roomEntered();
}
function goWest() {
    var cur_pos = current_location.split(",");
    cur_pos[0] = (parseInt(cur_pos[0]) - 1).toString();
    current_location = cur_pos.join(",");
    setInfoText("You walk west.");
    updateActions();
    updateStatusInfo();
    roomEntered();
}
function roomEntered() {
    if (map[current_location]["Events"] && map[current_location]["Events"]["RoomEntered"]) {
        map[current_location]["Events"]["RoomEntered"].forEach(function (action) {
            doGameAction(action);
        });
    }
}
function doGameAction(action) {
    if (action["Conditions"]) {
        var failed_1 = false;
        action["Conditions"].forEach(function (condition) {
            switch (condition["Type"]) {
                case "RoomFlagEquals":
                    failed_1 || (failed_1 = map[current_location]["Flags"][condition["ID"]] != condition["Value"]);
                    break;
                default:
                    break;
            }
        });
        if (failed_1) {
            return;
        }
    }
    switch (action["Action"]) {
        case "GiveItem":
            if (inventory[action["ID"]]) {
                inventory[action["ID"]] += action["Count"];
            }
            else {
                inventory[action["ID"]] = action["Count"];
            }
            setInfoText("Got ".concat(action['Count'], " ").concat(action['ID']));
            refreshItems();
            break;
        case "TakeItem":
            if (inventory[action["ID"]]) {
                inventory[action["ID"]] -= action["Count"];
                if (inventory[action["ID"]] <= 0) {
                    delete inventory[action["ID"]];
                    selected_item = "Hand";
                }
            }
            refreshItems();
            break;
        case "ShowInfo":
            setInfoText(action["Text"]);
            break;
        case "SetRoomFlag":
            map[current_location]["Flags"][action["ID"]] = action["Value"];
            break;
        case "ChangeRoomInfo":
            map[current_location]["Info"] = action["Text"];
            break;
        case "SetDirection":
            map[current_location]["Directions"][action["Direction"]] = action["State"];
            updateActions();
            break;
        case "Encounter":
            startBattle(action["ID"]);
            break;
        case "Teleport":
            current_location = action["Room"];
            updateActions();
            updateStatusInfo();
            roomEntered();
            break;
        case "LostAndFound":
            if (lostAndFound.length == 0) {
                setInfoText("There's nothing in the box.");
            }
            else {
                var index = Math.floor(Math.random() * lostAndFound.length);
                doGameAction({
                    "Action": "GiveItem",
                    "ID": lostAndFound.splice(index, 1)[0],
                    "Count": 1
                });
            }
            refreshItems();
            break;
        default:
            break;
    }
}
//
// Battle Stuff
//
var canvas = document.getElementById("battle-canvas");
var ctx = canvas.getContext("2d");
function loadSound(src) {
    var snd = document.createElement("audio");
    snd.src = src;
    snd.load();
    return snd;
}
function loadSounds(srcs) {
    var sndgroup = {
        "sfx": [],
        "play": function () { sndgroup.sfx[Math.floor(Math.random() * sndgroup.sfx.length)].play(); }
    };
    srcs.forEach(function (src) {
        sndgroup.sfx.push(loadSound(src));
    });
    return sndgroup;
}
function loadImage(src) {
    return new Promise(function (res, reject) {
        var img = document.createElement("img");
        img.onload = function () {
            res(img);
        };
        img.src = src;
    });
}
var opponents = {
    "Headless Rifleman": {
        "Name": "Headless Rifleman",
        "Entrances": [
            "Headless Rifleman marches in.",
            "Headless Rifleman blocks the way!",
            "Headless Rifleman gets into position."
        ],
        "HP": 40,
        "MaxHP": 40,
        "AT": [2, 5],
        "Speed": 20,
        "XP": 5,
        "Sprite": null
    },
    "The muggers": {
        "Name": "Muggers A & B",
        "Entrances": [
            "Mugger B begrungingly joins Mugger A." // I couldn't be bother to figure out more dialog
        ],
        "HP": 120,
        "MaxHP": 120,
        "AT": [4, 7],
        "Speed": 10,
        "XP": 10,
        "Sprite": null
    }
};
var current_opponent = null;
var opponent_shake = 0;
var player_turn = true;
var MaxHP = 80;
var HP = MaxHP;
var Level = 1;
var XP = 0;
var AT = 1;
var MaxXP = 50;
var Speed = 20;
var hit = loadSounds([
    "sounds/hit1.wav",
    "sounds/hit2.wav",
    "sounds/hit3.wav",
    "sounds/hit4.wav"
]);
var levelup = loadSound("sounds/levelup.wav");
var criticalhit = loadSound("sounds/criticalhit.wav");
var tada = loadSound("sounds/tada.mp3");
Promise.all([
    loadImage("images/headless_rifleman.png"),
    loadImage("images/muggers.png")
]).then(function (Sprites) {
    opponents["Headless Rifleman"]["Sprite"] = Sprites[0];
    opponents["The muggers"]["Sprite"] = Sprites[1];
    update();
});
function update() {
    drawBackground();
    if (current_opponent) {
        var shake = Math.max(Math.min(Math.sin(Date.now() / 10) * opponent_shake / 5, 32), -32);
        ctx.drawImage(current_opponent["Sprite"], (canvas.width - current_opponent["Sprite"].width) / 2 + shake, 0);
        var bar_color = Math.round((current_opponent["HP"] / current_opponent["MaxHP"]) * 15);
        ctx.fillStyle = "#".concat((15 - bar_color).toString(16)).concat(bar_color.toString(16), "0");
        ctx.fillRect((canvas.width - current_opponent["MaxHP"]) / 2, 138, current_opponent["HP"], 4);
    }
    opponent_shake = Math.max(opponent_shake - 1, 0);
    requestAnimationFrame(update);
}
function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Vertical lines
    ctx.strokeStyle = "#F0F4";
    for (var i = 0; i < 10; i++) {
        var offset = Math.floor((Date.now() / 1000 + i) * Math.floor(canvas.height / 10)) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, 0.5 + offset);
        ctx.lineTo(canvas.width, 0.5 + offset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0.5 + canvas.height - offset);
        ctx.lineTo(canvas.width, 0.5 + canvas.height - offset);
        ctx.stroke();
    }
    // Horizontal lines
    ctx.strokeStyle = "#F0F8";
    for (var i = 0; i < 8; i++) {
        var offset = Math.floor(Math.abs(Math.sin(Date.now() / 1000 + i * 125) * Math.floor(Math.sin(Date.now() / 1000) * 10 + 30)));
        ctx.beginPath();
        ctx.moveTo(0.5 + offset, 0);
        ctx.lineTo(0.5 + offset, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5 + canvas.width - 1 - offset, 0);
        ctx.lineTo(0.5 + canvas.width - 1 - offset, canvas.height);
        ctx.stroke();
    }
}
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
function damangeOpponent(min, max) {
    var DMG = Math.round(randomRange(min, max));
    opponent_shake = 10 * DMG;
    current_opponent["HP"] -= DMG;
    if (current_opponent["HP"] <= 0) {
        endBattle();
    }
    return DMG;
}
function updateBattleStatusbar() {
    document.querySelector("#HP-status").textContent = "HP: " + HP.toString();
}
function enemyTurn() {
    if (Math.random() * 100 <= Speed) {
        setInfoText("OP missed!".replace("OP", current_opponent["Name"]));
    }
    else {
        var crit = Math.random() * 100 < 5;
        // TODO: Unique dialog for different enemies.
        if (!crit) {
            setInfoText("OP attacks!".replace("OP", current_opponent["Name"]));
            HP -= Math.round(randomRange(current_opponent["AT"][0], current_opponent["AT"][1]));
            hit.play();
        }
        else {
            setInfoText("OP attacks and crits!".replace("OP", current_opponent["Name"]));
            HP -= Math.round(randomRange(current_opponent["AT"][0] * 2, current_opponent["AT"][1] * 2));
            hit.play();
            criticalhit.play();
        }
        updateBattleStatusbar();
    }
    player_turn = true;
}
function useItemInBattle() {
    if (!player_turn)
        return;
    if (items[selected_item]["DMG"]) {
        if (Math.random() * 100 < current_opponent["Speed"]) {
            setInfoText("You missed!");
        }
        else {
            var crit = Math.random() * 100 <= items[selected_item]["CritChance"];
            setInfoText(items[selected_item]["HitDialog"].replace("OP", current_opponent["Name"]) + (crit ? " And got a critical hit!" : ""));
            damangeOpponent(items[selected_item]["DMG"][0] * AT * (crit ? 2 : 1), items[selected_item]["DMG"][1] * AT * (crit ? 2 : 1));
            hit.play();
            if (crit) {
                criticalhit.play();
            }
        }
    }
    player_turn = false;
    setTimeout(enemyTurn, randomRange(1000, 2000));
}
function startBattle(Opponent) {
    document.querySelector("#battle-ui").querySelector(".title-bar-text").textContent = "Battle - " + Opponent;
    current_opponent = Object.assign({}, opponents[Opponent]);
    setInfoText(current_opponent["Entrances"][Math.floor(Math.random() * current_opponent["Entrances"].length)]);
    document.querySelector("#go-north").setAttribute("disabled", "true");
    document.querySelector("#go-east").setAttribute("disabled", "true");
    document.querySelector("#go-south").setAttribute("disabled", "true");
    document.querySelector("#go-west").setAttribute("disabled", "true");
    document.querySelector("#battle-ui").parentElement.appendChild(document.querySelector("#battle-ui"));
    document.querySelector("#battle-ui").classList.add("active");
    player_turn = true;
}
function endBattle() {
    updateActions();
    opponent_shake = 0;
    XP += current_opponent["XP"];
    if (XP >= MaxXP) {
        XP -= MaxXP;
        MaxXP *= 2;
        Level += 1;
        MaxHP += Math.ceil(MaxHP / Level);
        AT += 1;
        levelup.play();
    }
    HP = MaxHP;
    updateBattleStatusbar();
    current_opponent = null;
    document.querySelector("#battle-ui").classList.remove("active");
    setInfoText("YOU WON!");
    tada.play();
}
