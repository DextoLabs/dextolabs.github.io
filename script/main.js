var container, stats;
var camera, controls, scene, renderer;
var hand = {};
var handDef = new THREE.Group();
var thumbDef = new THREE.Group();
var material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    shading: THREE.FlatShading
});
var rotationInterval = 0.01;

//ligament angles
var angle1 = Math.PI / 2;
var angle2 = Math.PI / 2 + 0.2;
var angle3 = Math.PI / 2 + 0.6;
var angle4 = Math.PI / 2 + 1.0;

//defaultAnimation directions
var rotDirection = 1
var rot2Direction = 1
var rot3Direction = 1
var rot4Direction = 1

//ligament animations
var goalAngle1 = Math.PI / 4;
var goalAngle2 = Math.PI / 4;
var goalAngle3 = Math.PI / 4;
var goalAngle4 = Math.PI / 4;

//hand postion
var dataX = 0
var dataY = 0
var dataZ = 0

var fingerData = 0; //current finger event
var zeros = 100;
var ref = new Firebase("https://angelhacks.firebaseio.com/");
var moving = false;
var limitCount = 0;

init();
setInterval(render, 10);

document.onkeyup = function (e) {
    e = e || window.event;
    if(e.keyCode == 69 && e.shiftKey && e.altKey && e.ctrlKey){
      $(".modal").hide();
      $(".fade").hide();
    }
};

myo.on('*', function(event, data) {
    if (event == 'accelerometer') {
        dataX = data.x
        dataY = data.y
        dataZ = data.z
    }
})

var count = 0.01;


function animate() {
    /* count+= .01; */
    //load next animation frame
    requestAnimationFrame(animate);

    //hand animation
    getGoalAngle();
    rotateToAngle(goalAngle1, goalAngle2, goalAngle3, goalAngle4)

    if (limitCount % 10 == 0) {
        ref.child('rohan').update({
            ring1: Math.floor((angle1) * 180 / Math.PI),
            middle1: Math.floor((angle2) * 180 / Math.PI),
            pointer1: Math.floor((angle3) * 180 / Math.PI),
            pinkie1: Math.floor((angle4) * 180 / Math.PI),
            ring2: Math.floor((angle1) * 180 / Math.PI),
            middle2: Math.floor((angle2) * 180 / Math.PI),
            pointer2: Math.floor((angle3) * 180 / Math.PI),
            pinkie2: Math.floor((angle4) * 180 / Math.PI)
        })
    }
    limitCount++;

    setAngle();
    storeHandPos();
    //defaultAnimation();
    moveHand(dataX*zeros, dataY*zeros, dataZ*zeros);
    rotateHand(count, 0, 0);


    controls.update();
}


function getGoalAngle() {
    var offset = Math.PI / 2 + Math.PI / 32;
    var rightAng = Math.PI / 2;

    if (fingerData == 0 || fingerData == 7) {
        //flat
        goalAngle1 = offset;
        goalAngle2 = offset;
        goalAngle3 = offset;
        goalAngle4 = offset;
    }
    if (fingerData == 1 || fingerData == 4) {
        //fist
        goalAngle1 = offset + rightAng * .73;
        goalAngle2 = offset + rightAng * .71;
        goalAngle3 = offset + rightAng * .76;
        goalAngle4 = offset + rightAng * .8;
    }
    if (fingerData == 2) {
        //thumb and pointer pinch
        goalAngle1 = offset + rightAng * .45;
        goalAngle2 = offset;
        goalAngle3 = offset;
        goalAngle4 = offset;
    }
    if (fingerData == 3) {
        //thumb and middle
        goalAngle1 = offset;
        goalAngle2 = offset + rightAng * .55;
        goalAngle3 = offset;
        goalAngle4 = offset;
    }
    if (fingerData == 5) {
        //thumb and ring
        goalAngle1 = offset;
        goalAngle2 = offset;
        goalAngle3 = offset + rightAng * .55;
        goalAngle4 = offset;
    }
    if (fingerData == 6) {
        //thumb and pinkie
        goalAngle1 = offset;
        goalAngle2 = offset;
        goalAngle3 = offset;
        goalAngle4 = offset + rightAng * .60;
    }
}

function rotateToAngle(goal1, goal2, goal3, goal4) {
    var angRate = 0.015

    if (angle1 > goal1 + angRate) {
        angle1 -= angRate;
    } else if (angle1 < goal1 - angRate) {
        angle1 += angRate;
    }

    if (angle2 > goal2 + angRate) {
        angle2 -= angRate;
    } else if (angle2 < goal2 - angRate) {
        angle2 += angRate;
    }

    if (angle3 > goal3 + angRate) {
        angle3 -= angRate;
    } else if (angle3 < goal3 - angRate) {
        angle3 += angRate;
    }

    if (angle4 > goal4 + angRate) {
        angle4 -= angRate;
    } else if (angle4 < goal4 - angRate) {
        angle4 += angRate;
    }
}

function init() {

    //camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;

    //camera controls
    controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.minDistance = 0;
    controls.maxDistance = 1500;
    controls.addEventListener('change', render);

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xcccccc, 0.0002);

    //world

    createHand();

    //grid
    createGrid()

    //lights
	  light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    light = new THREE.DirectionalLight(0x000000, 1);
    light.position.set(-1, -1, -1);
    scene.add(light);

    light = new THREE.AmbientLight(0x202020, 1);
    scene.add(light);




    //renderer
    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    //rendering in container
    container = document.getElementById('container');
    container.appendChild(renderer.domElement);


    window.addEventListener('resize', onWindowResize, false);

    //initial render
    animate();

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function render() {
    renderer.render(scene, camera);
}

function createFinger(shift) {
    var finger = {};

    var ligLength = 50;
    var ligRadius = 5;
    var jointRadius = 10;

    for (var i = 1; i <= 3; i++) {
        if (i > 1) {
            jointRadius -= 1;
        }

        var sphere = new THREE.SphereGeometry(jointRadius, 8, 8);
        var cylinder;
        if (i == 3) {
            cylinder = new THREE.CylinderGeometry(ligRadius, ligRadius, ligLength - 10, 8);
        } else {
            cylinder = new THREE.CylinderGeometry(ligRadius, ligRadius, ligLength, 8);
        }
        cylinder.applyMatrix(new THREE.Matrix4().makeTranslation(0, ligLength / 2, 0));



        var joint = new THREE.Mesh(sphere, material);
        var ligament = new THREE.Mesh(cylinder, material);

        //reset finger orgin
        ligament.rotation.x = Math.PI / 2;
        joint.position.z = i * ligLength;
        if (i == 3) {
            ligament.position.z = i * ligLength - 900;
        } else {
            ligament.position.z = i * ligLength;
        }

        //offset finger starting position
        if (i == 2) {
            ligament.rotation.x += Math.PI / 8;
        } else if (i == 3) {
            ligament.rotation.x += Math.PI / 4;
        }

        ligament.position.x = (shift - 1) * 22
        joint.position.x = (shift - 1) * 22


        finger["lig" + i.toString()] = ligament;
        finger["joint" + i.toString()] = joint;

        scene.add(joint);
        scene.add(ligament);
    }
    return finger;
}

function createHand() {
    for (var i = 1; i <= 4; i++) {
        hand["finger" + i.toString()] = createFinger(-i);
    }

    var handBase = {}
    for (var i = 1; i <= 2; i++) {
        var cylinder = new THREE.CylinderGeometry(5, 5, 80, 8);
        var sidehand = new THREE.Mesh(cylinder, material);
        sidehand.rotation.x = Math.PI / 2;
        sidehand.position.x = ((i - 1) * -66.5) - 44;
        scene.add(sidehand);
        handBase["sidehand" + i.toString()] = sidehand;
    }

    var geometry = new THREE.TorusGeometry(33.25, 5, 8, 8, Math.PI);
    var backhand = new THREE.Mesh(geometry, material);
    backhand.position.x = -77.25;
    backhand.position.z = -40;
    backhand.rotation.x = Math.PI * 3 / 2;
    scene.add(backhand);
    handBase["backhand"] = backhand;

    hand["base"] = handBase;



    var thumb = {};

    var ligLength = 50;
    var ligRadius = 5;
    var jointRadius = 10;


    for (var i = 1; i <= 2; i++) {


        var sphere = new THREE.SphereGeometry(jointRadius, 8, 8);
        var cylinder = new THREE.CylinderGeometry(ligRadius, ligRadius, ligLength, 8);
        cylinder.applyMatrix(new THREE.Matrix4().makeTranslation(0, ligLength / 2, 0));



        var joint = new THREE.Mesh(sphere, material);
        var ligament = new THREE.Mesh(cylinder, material);

        //reset finger orgin
        ligament.rotation.x = Math.PI / 2;
        joint.position.z = i * ligLength;
        ligament.position.z = i * ligLength;
        ligament.position.x = -20;
        joint.position.x = -20;

        if (i == 1) {
            ligament.rotation.x += Math.PI * .4
            ligament.rotation.z -= Math.PI * .1
        } else {
            joint.position.z -= 35;
            joint.position.y -= 45;
            joint.position.x += 15;
            ligament.position.z -= 35;
            ligament.position.y -= 45;
            ligament.position.x += 15;
            ligament.rotation.x += Math.PI * .4
            ligament.rotation.z += Math.PI * .05
        }


        thumb["lig" + i.toString()] = ligament;
        thumb["joint" + i.toString()] = joint;

        thumbDef.add(joint);
        thumbDef.add(ligament);
    }
    thumbDef.position.x += 100;

    scene.add(thumbDef);
    hand["thumb"] = thumb;

    storeHandPos();

}

function storeHandPos() {
    for (var key in hand) {
        if (hand.hasOwnProperty(key)) {
            var obj = hand[key];

            var objDef = {}
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    handDef.add(obj[prop]);
                    scene.add(handDef)
                    objDef[prop] = {
                        "x": obj[prop].position.x,
                        "y": obj[prop].position.y,
                        "z": obj[prop].position.z
                    }

                }
            }
        }
    }
}

function createGrid() {
    var size = 1000,
        step = 50;

    var lines = new THREE.Geometry();

    for (var i = -size; i <= size; i += step) {
        lines.vertices.push(new THREE.Vector3(-size, -100, i));
        lines.vertices.push(new THREE.Vector3(size, -100, i));

        lines.vertices.push(new THREE.Vector3(i, -100, -size));
        lines.vertices.push(new THREE.Vector3(i, -100, size));
    }

    var gridMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.2
    });

    var grid = new THREE.Line(lines, gridMaterial, THREE.LinePieces);
    scene.add(grid);
}

function moveHand(x, y, z) {
    handDef.position.x = x;
    handDef.position.y = y;
    handDef.position.z = z;
}

function rotateHand(x, y, z) {
    handDef.rotation.x = x;
    handDef.rotation.y = y;
    handDef.rotation.z = z;
}

function setAngle() {
    //ligament 1
    hand.finger1.lig1.rotation.x = angle1;
    //ligament 2
    var f1lig1RotX = hand.finger1.lig1.rotation.x;
    var f1lig1PosY = hand.finger1.lig1.position.y;
    var f1lig1PosZ = hand.finger1.lig1.position.z;
    hand.finger1.lig2.position.y = f1lig1PosY + (50 * Math.cos(f1lig1RotX));
    hand.finger1.lig2.position.z = f1lig1PosZ + (50 * Math.sin(f1lig1RotX));
    hand.finger1.lig2.rotation.x = f1lig1RotX + ((Math.PI / 2) * ((angle1 - Math.PI / 2) / (Math.PI / 2)));

    hand.finger1.joint2.position.y = f1lig1PosY + (50 * Math.cos(f1lig1RotX));
    hand.finger1.joint2.position.z = f1lig1PosZ + (50 * Math.sin(f1lig1RotX));
    //ligament 3
    var f1lig2RotX = hand.finger1.lig2.rotation.x;
    var f1lig2PosY = hand.finger1.lig2.position.y;
    var f1lig2PosZ = hand.finger1.lig2.position.z;
    hand.finger1.lig3.position.y = f1lig2PosY + (50 * Math.cos(f1lig2RotX));
    hand.finger1.lig3.position.z = f1lig2PosZ + (50 * Math.sin(f1lig2RotX));
    hand.finger1.lig3.rotation.x = f1lig2RotX + ((Math.PI / 2) * ((angle1 - Math.PI / 2) / (Math.PI / 2)));

    hand.finger1.joint3.position.y = f1lig2PosY + (50 * Math.cos(f1lig2RotX));
    hand.finger1.joint3.position.z = f1lig2PosZ + (50 * Math.sin(f1lig2RotX));

    /********************************************************************/

    //ligament 1
    hand.finger2.lig1.rotation.x = angle2;
    //ligament 2
    var f2lig1RotX = hand.finger2.lig1.rotation.x;
    var f2lig1PosY = hand.finger2.lig1.position.y;
    var f2lig1PosZ = hand.finger2.lig1.position.z;
    hand.finger2.lig2.position.y = f2lig1PosY + (50 * Math.cos(f2lig1RotX));
    hand.finger2.lig2.position.z = f2lig1PosZ + (50 * Math.sin(f2lig1RotX));
    hand.finger2.lig2.rotation.x = f2lig1RotX + ((Math.PI / 2) * ((angle2 - Math.PI / 2) / (Math.PI / 2)));

    hand.finger2.joint2.position.y = f2lig1PosY + (50 * Math.cos(f2lig1RotX));
    hand.finger2.joint2.position.z = f2lig1PosZ + (50 * Math.sin(f2lig1RotX));
    //ligament 3
    var f2lig2RotX = hand.finger2.lig2.rotation.x;
    var f2lig2PosY = hand.finger2.lig2.position.y;
    var f2lig2PosZ = hand.finger2.lig2.position.z;
    hand.finger2.lig3.position.y = f2lig2PosY + (50 * Math.cos(f2lig2RotX));
    hand.finger2.lig3.position.z = f2lig2PosZ + (50 * Math.sin(f2lig2RotX));
    hand.finger2.lig3.rotation.x = f2lig2RotX + ((Math.PI / 2) * ((angle2 - Math.PI / 2) / (Math.PI / 2)));

    hand.finger2.joint3.position.y = f2lig2PosY + (50 * Math.cos(f2lig2RotX));
    hand.finger2.joint3.position.z = f2lig2PosZ + (50 * Math.sin(f2lig2RotX));

    /********************************************************************/

    //ligament 1
    hand.finger3.lig1.rotation.x = angle3;
    //ligament 2
    var f3lig1RotX = hand.finger3.lig1.rotation.x;
    var f3lig1PosY = hand.finger3.lig1.position.y;
    var f3lig1PosZ = hand.finger3.lig1.position.z;
    hand.finger3.lig2.position.y = f3lig1PosY + (50 * Math.cos(f3lig1RotX));
    hand.finger3.lig2.position.z = f3lig1PosZ + (50 * Math.sin(f3lig1RotX));
    hand.finger3.lig2.rotation.x = f3lig1RotX + ((Math.PI / 2) * ((angle3 - Math.PI / 2) / (Math.PI / 2)));

    hand.finger3.joint2.position.y = f3lig1PosY + (50 * Math.cos(f3lig1RotX));
    hand.finger3.joint2.position.z = f3lig1PosZ + (50 * Math.sin(f3lig1RotX));
    //ligament 3
    var f3lig2RotX = hand.finger3.lig2.rotation.x;
    var f3lig2PosY = hand.finger3.lig2.position.y;
    var f3lig2PosZ = hand.finger3.lig2.position.z;
    hand.finger3.lig3.position.y = f3lig2PosY + (50 * Math.cos(f3lig2RotX));
    hand.finger3.lig3.position.z = f3lig2PosZ + (50 * Math.sin(f3lig2RotX));
    hand.finger3.lig3.rotation.x = f3lig2RotX + ((Math.PI / 2) * ((angle3 - Math.PI / 2) / (Math.PI / 2)));

    hand.finger3.joint3.position.y = f3lig2PosY + (50 * Math.cos(f3lig2RotX));
    hand.finger3.joint3.position.z = f3lig2PosZ + (50 * Math.sin(f3lig2RotX));

    /********************************************************************/

    //ligament 1
    hand.finger4.lig1.rotation.x = angle4;
    //ligament 2
    var lig1RotX = hand.finger4.lig1.rotation.x;
    var lig1PosY = hand.finger4.lig1.position.y;
    var lig1PosZ = hand.finger4.lig1.position.z;
    hand.finger4.lig2.position.y = lig1PosY + (50 * Math.cos(lig1RotX));
    hand.finger4.lig2.position.z = lig1PosZ + (50 * Math.sin(lig1RotX));
    hand.finger4.lig2.rotation.x = lig1RotX + ((Math.PI / 2) * ((angle4 - Math.PI / 2) / (Math.PI / 2)));

    hand.finger4.joint2.position.y = lig1PosY + (50 * Math.cos(lig1RotX));
    hand.finger4.joint2.position.z = lig1PosZ + (50 * Math.sin(lig1RotX));
    //ligament 3
    var lig2RotX = hand.finger4.lig2.rotation.x;
    var lig2PosY = hand.finger4.lig2.position.y;
    var lig2PosZ = hand.finger4.lig2.position.z;
    hand.finger4.lig3.position.y = lig2PosY + (50 * Math.cos(lig2RotX));
    hand.finger4.lig3.position.z = lig2PosZ + (50 * Math.sin(lig2RotX));
    hand.finger4.lig3.rotation.x = lig2RotX + ((Math.PI / 2) * ((angle4 - Math.PI / 2) / (Math.PI / 2)));

    hand.finger4.joint3.position.y = lig2PosY + (50 * Math.cos(lig2RotX));
    hand.finger4.joint3.position.z = lig2PosZ + (50 * Math.sin(lig2RotX));



}

function defaultAnimation() {
    if (angle1 > 3 * Math.PI / 4) {
        rotDirection = -0.01;
    } else if (angle1 < Math.PI / 2) {
        rotDirection = 0.01;
    }

    angle1 += rotDirection;



    if (angle2 > 3 * Math.PI / 4) {
        rot2Direction = -0.01;
    } else if (angle2 < Math.PI / 2) {
        rot2Direction = 0.01;
    }

    angle2 += rot2Direction;

    if (angle3 > 3 * Math.PI / 4) {
        rot3Direction = -0.01;
    } else if (angle3 < Math.PI / 2) {
        rot3Direction = 0.01;
    }

    angle3 += rot3Direction;

    if (angle4 > 3 * Math.PI / 4) {
        rot4Direction = -0.01;
    } else if (angle4 < Math.PI / 2) {
        rot4Direction = 0.01;
    }

    angle4 += rot4Direction;
}
