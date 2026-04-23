# Real-Time-3D-XR-Visualization-pw1-Robot_in_Kitchen
In this practical work, we developed a  complete interactive scene - a Robot working in Kitchen using 3D geometry, materials, lighting, and transformation hierarchies . 

Exercise 1: Kitchen Environment
Scene setup with camera and renderer;
Floor and walls using basic geometries;
Kitchen counter;
Interactive Objects (e.g., cup, plate);
OrbitControls added for camera navigation;


Exercise 2: Humanoid Robot 
Built robot using scene graph hierarchy;
Body parts added:
Torso,
Shoulder,
Upper arm,
Elbow,
Forearm,
Hand/Gripper,
Proper pivot alignment for realistic movement.

Exercise 3: Lighting & Shadows
Ambient lighting for better illumination;
SpotLight/PointLight added;
For realistic shadows (castShadow, receiveShadow added;
For realistic 3D mesh (MeshStandardMaterial added) ;
GUI controls for lights & materials;

Exercise 4: Animation & Interaction
Animated robot arms using Forward Kinematics;
Smooth motion with Math.sin(Date.now());
OrbitControls added in all the excercises for camera navigation;
GUI for manual joint control (Shoulder and elbow angle control).

Exercise 5: Web XR control 
Please ensure webXR chrome extension is enabled in your browser. 
VR controller interaction added; 
Inverse Kinematics (IK) for robot arm control added ;
AR/VR mode switching through XR button .


