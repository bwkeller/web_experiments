var galaxy = function () {
    var element = document.getElementById( 'galaxy' );
    var pi2 = Math.PI*2; //2*pi, convenience variable
    var R0 = 50; //Scale length
    var dt = 2; //Timestep
    var eps = 10; //Softening for perturbator
    var Pmass = 0; //Initialize the perturbator with 0 mass and large distance
    var velocity = new Array(); //Velocity vectors
    var position = new THREE.Geometry(); //Positions stored as vertices
    var mouse = new THREE.Vector3([1e7,1e7,0]); //Mouse position (perturbator position too)

    var texture = THREE.ImageUtils.loadTexture("star.png")
    var camera = new THREE.PerspectiveCamera( 60, element.offsetWidth / element.offsetHeight, 1, 3000 );
    var materials = new THREE.PointsMaterial( { map:texture, size: 20, opacity:0.1, blending:THREE.AdditiveBlending, transparent:true, sizeAttenuation:false, depthTest:false}); //This sets up how our stars appear
    var scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( element.offsetWidth, element.offsetHeight );
    element.appendChild( renderer.domElement );
    position.dynamic = true; //Allow position vertices to be updated
    camera.position.z = 500; //Reasonably close, increase for greater distance

    var gravity = function (pos) {
        var accel = new THREE.Vector3();
        var perturbator = new THREE.Vector3();
        var offset = new THREE.Vector3();
        var NI_frame = new THREE.Vector3();//We need to run the whole thing in an accelerating frame to keep the potential centered.
        NI_frame.add(mouse).normalize().multiplyScalar(-1.0*Pmass/(mouse.lengthSq()+eps*eps));
        offset.subVectors(pos, mouse);
        perturbator.add(offset).normalize().multiplyScalar(-1.0*Pmass/(offset.lengthSq()+eps*eps));
        accel.add(pos).normalize().multiplyScalar(-1.0/(pos.length()));
        accel.add(perturbator);
        accel.add(NI_frame);
        return accel;
    }

    //Generate the particles, with a slight tilt
    //We need both positions and velocities (flat rotation curve)
    var rotation = new THREE.Euler(pi2/4.7,pi2/2.2,0, 'XYZ')
    for ( i = 0; i < 10000; i ++ ) {

        var vertex = new THREE.Vector3();
        var vel = new THREE.Vector3();
        var theta = Math.random() * pi2;
        var R = -Math.log(Math.random())*R0+10;
        vertex.x = R*Math.cos(theta);
        vertex.y = R*Math.sin(theta);
        vertex.z = 0;
        vel.x = -Math.sin(theta);
        vel.y = Math.cos(theta);
        vertex.applyEuler(rotation);
        vel.applyEuler(rotation);
        position.vertices.push( vertex );
        velocity.push(vel);

    }

    scene.add(new THREE.Points( position, materials));
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    animate();

    //Callback to get mouse position.
    function onDocumentMouseMove( event ) {
        event.preventDefault();
        mouse.x = event.clientX - 0.5*element.offsetWidth;
        mouse.y = -event.clientY + 0.5*element.offsetHeight;
        Pmass = 20;
    }

    //Animate using the HTML5 requestAnimationFrame
    //This also integrates the positions and velocities of the particles using
    //a simple Leapfrog/Velocity-Verlet scheme.
    function animate() {
        requestAnimationFrame( animate );
        renderer.render(scene, camera);
        //Kick
        for (i in velocity)
        {
            velocity[i].addScaledVector(gravity(position.vertices[i]), 0.5*dt);
        }
        //Drift
        for (i in position.vertices)
        {
            position.vertices[i].addScaledVector(velocity[i], dt);
        }
        //Kick
        for (i in velocity)
        {
            velocity[i].addScaledVector(gravity(position.vertices[i]), 0.5*dt);
        }
        position.verticesNeedUpdate = true;
    }
}
galaxy();

