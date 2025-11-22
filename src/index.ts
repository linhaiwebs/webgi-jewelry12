document.body.style.overflowY = "hidden"
import {
    ViewerApp,
    AssetManagerPlugin,
    timeout,
    SSRPlugin,
    mobileAndTabletCheck,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSAOPlugin,
    GroundPlugin,
    FrameFadePlugin,
    DiamondPlugin,
    // DepthOfFieldPlugin,
    BufferGeometry,
    MeshStandardMaterial2,
    BloomPlugin, 
    TemporalAAPlugin, 
    RandomizedDirectionalLightPlugin, 
    AssetImporter, 
    Color, 
    Mesh
} from "webgi"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from '@studio-freight/lenis'

import "./styles.scss"

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
    duration: 2.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -5 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    mouseMultiplier: 1,
  })
  
function raf(time: Number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
  
requestAnimationFrame(raf)

const diamondsObjectNames = [
    'diamonds',
    'diamonds001',
    'diamonds002',
    'diamonds003',
    'diamonds004',
    'diamonds005',
]

const diamondsObjectNames2 = [
    'Object'
]

let usingCustomColors = false

async function setupViewer(){

    const canvas = document.getElementById('webgi-canvas') as HTMLCanvasElement
    const viewer = new ViewerApp({
        canvas,
        useGBufferDepth: true,
        isAntialiased: false
    })

    const isMobile = mobileAndTabletCheck()

    viewer.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 1)

    const manager = await viewer.addPlugin(AssetManagerPlugin)
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target

    // Interface Elements
    const exploreView = document.querySelector('.cam-view-3') as HTMLElement
    const canvasView = document.getElementById('webgi-canvas') as HTMLElement
    const canvasContainer = document.getElementById('webgi-canvas-container') as HTMLElement
    const exitContainer = document.querySelector('.exit--container') as HTMLElement
    const loaderElement = document.querySelector('.loader') as HTMLElement
    const header = document.querySelector('.header') as HTMLElement
    const camView1 =  document.querySelector('.cam-view-1') as HTMLElement
    const camView2 =  document.querySelector('.cam-view-2') as HTMLElement
    const camView3 =  document.querySelector('.cam-view-3') as HTMLElement
    const gemMenu =  document.querySelector('.gem--menu') as HTMLElement
    const footerContainer = document.querySelector('.footer--container') as HTMLElement
    const footerMenu =  document.querySelector('.footer--menu') as HTMLElement
    const materialsMenu = document.querySelector('.materials--menu') as HTMLElement
    const configMaterial = document.querySelector('.config--material') as HTMLElement
    const configGem = document.querySelector('.config--gem') as HTMLElement
    const closeConfigMaterial = document.querySelector('.close-materials') as HTMLElement
    const configRing = document.querySelector('.config--ring') as HTMLElement
    const closeConfigGem = document.querySelector('.close-gems') as HTMLElement
    const sidebar = document.querySelector('.side-bar') as HTMLElement 
    let nightMode = false
    let firstLooad = true
    let ringModel = 1

    // Add WEBGi plugins
    await viewer.addPlugin(GBufferPlugin)
    await viewer.addPlugin(new ProgressivePlugin(32))
    await viewer.addPlugin(new TonemapPlugin(true, false,
        [
          `// This part is added before the main function in tonemap pass.
            vec4 vignette(vec4 color, vec2 uv, float offset, float darkness){
                uv = ( uv - vec2( 0.5 ) ) * vec2( offset );
                return vec4( mix( color.rgb, vec3( 0.17, 0.00, 0.09 ), dot( uv, uv ) ), color.a );
            }`,
            // This part is added inside main function after tonemapping before encoding conversion.
            `gl_FragColor = vignette(gl_FragColor, vUv, 1.1, 0.8);`
        ])
     )
    const ssr = await viewer.addPlugin(SSRPlugin)
    const ssao = await viewer.addPlugin(SSAOPlugin)
    await viewer.addPlugin(FrameFadePlugin)
    await viewer.addPlugin(GroundPlugin)
    const bloom = await viewer.addPlugin(BloomPlugin)
    await viewer.addPlugin(TemporalAAPlugin,)
    await viewer.addPlugin(DiamondPlugin)
    // const dof = await viewer.addPlugin(DepthOfFieldPlugin)
    await viewer.addPlugin(RandomizedDirectionalLightPlugin, false)
    viewer.setBackground(new Color('#EEB7B5').convertSRGBToLinear())

    ssr!.passes.ssr.passObject.lowQualityFrames = 0
    bloom.pass!.passObject.bloomIterations = 2
    ssao.passes.ssao.passObject.material.defines.NUM_SAMPLES = 4

    // WEBGi loader
    const importer = manager.importer as AssetImporter

    importer.addEventListener("onStart", (ev) => {
        // onUpdate()
    })

    importer.addEventListener("onProgress", (ev) => {
        const progressRatio = (ev.loaded / ev.total)
        document.querySelector('.progress')?.setAttribute('style',`transform: scaleX(${progressRatio})`)
    })

    importer.addEventListener("onLoad", (ev) => {
        if(firstLooad){
            introAnimation()
        } else{
            gsap.to('.loader', {x: '100%', duration: 0.8, ease: "power4.inOut", delay: 1})
        }
    })

    viewer.renderer.refreshPipeline()


    // WEBGi load model
    await manager.addFromPath("./assets/ring_webgi.glb")

    let ring: Mesh<BufferGeometry, MeshStandardMaterial2>, gold: Mesh<BufferGeometry, MeshStandardMaterial2>, silver: Mesh<BufferGeometry, MeshStandardMaterial2>
    let diamondObjects: any[] = []


    if (ringModel == 1){
        ring = viewer.scene.findObjectsByName('Scene')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
        silver = viewer.scene.findObjectsByName('silver')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
        gold = viewer.scene.findObjectsByName('gold')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
        for (const obj of diamondsObjectNames) {
            const o = viewer.scene.findObjectsByName(obj)[0]
            diamondObjects.push(o)
        }
    }else{
        ring = viewer.scene.findObjectsByName('ring-compare')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
        silver = viewer.scene.findObjectsByName('alliance')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
        gold = viewer.scene.findObjectsByName('entourage')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
        for (const obj of diamondsObjectNames2) {
            const o = viewer.scene.findObjectsByName(obj)[0]
            diamondObjects.push(o)
        }
        ring.rotation.set(Math.PI/2, 0.92, 0)
    }


    if(camera.controls){
        camera.controls!.enabled = false
    } 

    // WEBGi mobile adjustments
    if(isMobile){
        ssr.passes.ssr.passObject.stepCount /= 2
        bloom.enabled = false
        camera.setCameraOptions({fov:65})
    }

    window.scrollTo(0,0)

    await timeout(50)

    function introAnimation(){
        firstLooad = false
        const introTL = gsap.timeline()
        introTL
        .to('.loader', {x: '100%', duration: 0.8, ease: "power4.inOut", delay: 1})
        .fromTo(position, {x: isMobile ? 3 : 3, y: isMobile ? -0.8 : -0.8, z: isMobile ? 1.2 : 1.2}, {x: isMobile ? 1.28 : 1.28, y: isMobile ? -1.7 : -1.7, z: isMobile ? 5.86 : 5.86, duration: 4, onUpdate}, '-=0.8')
        .fromTo(target, {x: isMobile ? 2.5 : 2.5, y: isMobile ? -0.07 : -0.07, z: isMobile ? -0.1 : -0.1}, {x: isMobile ? -0.21 : 0.91, y: isMobile ? 0.03 : 0.03, z: isMobile ? -0.25 : -0.25, duration: 4, onUpdate}, '-=4')
        .fromTo('.header--container', {opacity: 0, y: '-100%'}, {opacity: 1, y: '0%', ease: "power1.inOut", duration: 0.8}, '-=1')
        .fromTo('.hero--scroller', {opacity: 0, y: '150%'}, {opacity: 1, y: '0%', ease: "power4.inOut", duration: 1}, '-=1')
        .fromTo('.hero--container', {opacity: 0, x: '100%'}, {opacity: 1, x: '0%', ease: "power4.inOut", duration: 1.8, onComplete: setupScrollAnimation}, '-=1')
        .fromTo('.side-bar', { opacity: 0, x: '50%' }, { opacity: 1, x: '0%', ease: "power4.inOut", duration: 2 }, '-=1')
        .to('.side-bar .unique', { opacity: 1, scale: 1.5, ease: "power4.inOut", duration: 2}, '-=1')
    }

    function setupScrollAnimation(){
        document.body.style.overflowY = "scroll"
        // document.body.removeChild(loaderElement)

        // customScrollingEnabled = true

        const tl = gsap.timeline({ default: {ease: 'none'}})

        // FOREVER
        tl.to(position, {x: -1.83, y: -0.14, z: 6.15,
            scrollTrigger: { trigger: ".cam-view-2",  start: "top bottom", end: "top top", scrub: true, immediateRender: false }, onUpdate
        })

        .to(target,{x: isMobile ? 0 : -0.78, y: isMobile ? 1.5 : -0.03, z: -0.12,
            scrollTrigger: { trigger: ".cam-view-2",  start: "top bottom", end: "top top", scrub: true, immediateRender: false }
        })
        .to(ring.rotation,{x: (ringModel == 1) ? 0 : -Math.PI/3, y: (ringModel == 1) ? 0 : -0.92 , z: (ringModel == 1) ? Math.PI/2 : 0,
            scrollTrigger: { trigger: ".cam-view-2",  start: "top bottom", end: "top top", scrub: true, immediateRender: false }
        })
        .fromTo(colorLerpValue, {x:0}, {x:1,
            scrollTrigger: { trigger: ".cam-view-2",  start: "top bottom", end: "top top", scrub: true, immediateRender: false }
            , onUpdate: function() {
                if(!usingCustomColors){
                    silver.material.color.lerpColors(new Color(0xfefefe).convertSRGBToLinear(), new Color(0xd28b8b).convertSRGBToLinear(), colorLerpValue.x)
                    gold.material.color.lerpColors(new Color(0xe2bf7f).convertSRGBToLinear(), new Color(0xd28b8b).convertSRGBToLinear(), colorLerpValue.x)
                    for (const o of diamondObjects) {
                        o.material.color.lerpColors(new Color(0xffffff).convertSRGBToLinear(), new Color(0x39cffe).convertSRGBToLinear(), colorLerpValue.x)
                    }
                }
        }})
        .to('.hero--scroller', {opacity: 0, y: '150%',
            scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: "top center", scrub: 1, immediateRender: false, pin: '.hero--scroller--container'
        }})

        .to('.hero--container', {opacity: 0, xPercent: '100', ease: "power4.out",
            scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: "top top", scrub: 1, immediateRender: false,
        }})

        .to('.forever--text-bg', {opacity: 0.1, ease: "power4.inOut",
            scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false,
        }})

        .fromTo('.forever--container', {opacity: 0, x: '-110%'}, {opacity: 1, x: '0%', ease: "power4.inOut",
            scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false,
        }})
        .addLabel("Forever")
        .to('.side-bar .unique', { opacity: 0.5, scale: 1, ease: "power4.inOut", duration: 2, scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false,}})
        .to('.side-bar .forever', { opacity: 1, scale: 1.5, ease: "power4.inOut", duration: 2, scrollTrigger: { trigger: ".cam-view-2", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false}})


        // // EMOTIONS SECTION
        .to(position,  {x: -0.06, y: -1.15, z: 4.42,
            scrollTrigger: { trigger: ".cam-view-3",  start: "top bottom", end: "top top", scrub: true, immediateRender: false,
        }, onUpdate
        })
        .to(target, {x: -0.01, y: 0.9, z: 0.07,
            scrollTrigger: { trigger: ".cam-view-3",  start: "top bottom", end: "top top", scrub: true, immediateRender: false }, onUpdate
        })
        .to(ring.rotation,{x: (ringModel == 1) ? 0 :0.92 , y:(ringModel == 1) ? 0 : 0.92, z: (ringModel == 1) ? -Math.PI /2 : Math.PI/3,
            scrollTrigger: { trigger: ".cam-view-3",  start: "top bottom", end: "top top", scrub: true, immediateRender: false }
        })
        .fromTo(colorLerpValue2, {x:0}, {x:1,
            scrollTrigger: { trigger: ".cam-view-3",  start: "top bottom", end: "top top", scrub: true, immediateRender: false }
            , onUpdate: function() {
   
                
                if(!usingCustomColors){
                    silver.material.color.lerpColors(new Color(0xd28b8b).convertSRGBToLinear(), new Color(0xf7c478).convertSRGBToLinear(), colorLerpValue2.x)
                    gold.material.color.lerpColors(new Color(0xd28b8b).convertSRGBToLinear(), new Color(0xf7c478).convertSRGBToLinear(), colorLerpValue2.x)
                    for (const o of diamondObjects) {
                        o.material.color.lerpColors(new Color(0x39cffe).convertSRGBToLinear(), new Color(0xf70db1).convertSRGBToLinear(), colorLerpValue2.x)
                    }
                }
        }})
        .to('.forever--container', {opacity: 0, x: '-110%', ease: "power4.inOut",
            scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false
        }})
        .to('.emotions--text-bg', {opacity: 0.1, ease: "power4.inOut",
            scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false,
        }})
        .fromTo('.emotions--content', {opacity: 0, y: '130%'}, {opacity: 1, y: '0%', duration: 0.5, ease: "power4.inOut",
            scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: "top top", scrub: 1, immediateRender: false
        }})
        
        .addLabel("Emotions")
        .to('.side-bar .forever', { opacity: 0.5, scale: 1, ease: "power4.inOut", duration: 2, scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false,}})
        .to('.side-bar .emotions', { opacity: 1, scale: 1.5, ease: "power4.inOut", duration: 2, scrollTrigger: { trigger: ".cam-view-3", start: "top bottom", end: 'top top', scrub: 1, immediateRender: false}})

    }

    let needsUpdate = true;
    function onUpdate(){
        needsUpdate = true;
    }

    // if(!isMobile){
    //     const sections = document.querySelectorAll('.section')
    //     const sectionTops: number[] = []
    //     sections.forEach(section=> {
    //         sectionTops.push(section.getBoundingClientRect().top)
    //     })
    //     setupCustomWheelSmoothScrolling(viewer, document.documentElement, sectionTops, )
    // }
    // else {
    //     createStyles(`
    //         .section-wrapper {
    //         scroll-snap-type: y mandatory;
    //         }

    //     `)
    // }

    viewer.addEventListener('preFrame', ()=>{
        // console.log(ring.rotation)
        if(needsUpdate){
            camera.positionUpdated(false)
            camera.targetUpdated(true)
            needsUpdate = false;
        }
    })

    // KNOW MORE EVENT
    document.querySelector('.button-scroll')?.addEventListener('click', () => {
        const element = document.querySelector('.cam-view-2')
        window.scrollTo({top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth'})
    })

    document.querySelector('.forever')?.addEventListener('click', () => {
        const element = document.querySelector('.cam-view-2')
        window.scrollTo({top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth'})
    })

    document.querySelector('.hero--scroller')?.addEventListener('click', () => {
        const element = document.querySelector('.cam-view-2')
        window.scrollTo({top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth'})
    })

    // CUSTOMIZE EVENT
    document.querySelector('.btn-customize')?.addEventListener('click', () => {
        exploreView.style.pointerEvents = "none"
        canvasView.style.pointerEvents = "all"
        canvasContainer.style.zIndex = "1"
        document.body.style.overflowY = "hidden"
        document.body.style.cursor = "grab"
        sidebar.style.display = "none"
        footerContainer.style.display = "flex"
        configAnimation()

        if (!musicPlay) {
            audio.play()
            audio.volume = 0.1
            audio.loop = true
            musicPlay = true
            
        }
        // customScrollingEnabled = false
    })
    const tlExplore = gsap.timeline()

    function configAnimation(){
        lenis.stop()

        tlExplore.to(position,{x: -0.17, y: -0.25, z: 8.5, duration: 2.5, onUpdate})
        .to(target, {x: 0, y: 0, z: 0, duration: 2.5, onUpdate}, '-=2.5')

        .to(ring.rotation,{x: (ringModel == 1) ? -Math.PI/2: 0, y: 0, z: (ringModel == 1) ? -Math.PI/2 : 0, duration: 2.5}, '-=2.5')
        .to('.emotions--content', {opacity: 0, x: '130%', duration: 1.5, ease: "power4.out", onComplete: onCompleteConfigAnimation}, '-=2.5')
        .fromTo('.footer--menu',{opacity: 0, y:'150%'}, {opacity: 1, y: '0%', duration: 1.5})

    }

    let colorLerpValue = {x: 0}
    let colorLerpValue2 = {x: 0}

    function onCompleteConfigAnimation(){
        exitContainer.style.display = "flex"
        if(camera.controls){
            camera.controls.enabled = true
            camera.controls.autoRotate = true
            camera.controls.minDistance = 5
            camera.controls.maxDistance = 13
            camera.controls.enablePan = false
            camera.controls.screenSpacePanning = false
        }
        // dof.pass!.passObject.enabled = false

    }


    document.querySelector('.button--exit')?.addEventListener('click', () => {
        exploreView.style.pointerEvents = "all"
        canvasView.style.pointerEvents = "none"
        canvasContainer.style.zIndex = "unset"
        document.body.style.overflowY = "auto"
        exitContainer.style.display = "none"
        document.body.style.cursor = "auto"
        sidebar.style.display = "block"
        footerContainer.style.display = "none"
        exitConfigAnimation()

        // customScrollingEnabled = true;
    })

    const tlExit = gsap.timeline()

    // EXIT EVENT
    function exitConfigAnimation(){

        if(camera.controls){
            camera.controls.enabled = true
            camera.controls.autoRotate = false
            camera.controls.minDistance = 0
            camera.controls.maxDistance = Infinity
        }

        lenis.start()
        
        // dof.pass!.passObject.enabled = true

        gemMenu.classList.remove('show')
        materialsMenu.classList.remove('show')
        if (document.querySelector('.footer--menu li.active')){
            document.querySelector('.footer--menu li.active')?.classList.remove('active')
        }

        tlExit.to(position,{x: -0.06, y: -1.15, z: 4.42, duration: 1.2, ease: "power4.out", onUpdate})
        .to(target, {x: -0.01, y: 0.9, z: 0.07, duration: 1.2, ease: "power4.out"}, '-=1.2')
        // .to(ring.rotation,{x: (ringModel == 1) ? 0 : Math.PI , y:0, z: 0}, '-=1.2') // funciona quando o default e 2
        .to(ring.rotation,{x: (ringModel == 1) ? 0 : 0.92 , y: (ringModel == 1) ? 0 : 0.92, z: (ringModel == 1) ? -Math.PI/2 : Math.PI/3}, '-=1.2')
        .to('.footer--menu',{opacity: 0, y:'150%'}, '-=1.2')
        .to('.emotions--content', {opacity: 1, x: '0%', duration: 0.5, ease: "power4.out"}, '-=1.2')

    }

    // NIGHT MODE
    document.querySelector('.night--mode')?.addEventListener('click', () => {
        toggleNightMode()
    })
    document.querySelector('.night--mode--2')?.addEventListener('click', () => {
        toggleNightMode()
    })

    function toggleNightMode(){
        if(!nightMode){
            header.classList.add('night--mode--filter')
            camView1.classList.add('night--mode--filter')
            camView2.classList.add('night--mode--filter')
            camView3.classList.add('night--mode--filter')
            exitContainer.classList.add('night--mode--filter')
            footerMenu.classList.add('night--mode--filter')
            viewer.setBackground(new Color(0x22052f).convertSRGBToLinear())
            nightMode = true
        } else{
            header.classList.remove('night--mode--filter')
            camView1.classList.remove('night--mode--filter')
            camView2.classList.remove('night--mode--filter')
            camView3.classList.remove('night--mode--filter')
            exitContainer.classList.remove('night--mode--filter')
            footerMenu.classList.remove('night--mode--filter')
            viewer.setBackground(new Color('#EEB7B5').convertSRGBToLinear())
            nightMode = false
        }
    }

    // GEM MENU
    configGem.addEventListener('click', () => {
        gemMenu.classList.add('show')
        materialsMenu.classList.remove('show')

        const gemCameraAnimation = gsap.timeline()

        gemCameraAnimation.to(position, {x: 1.6, y: 3.66, z: 2.55, duration: 1.5, onUpdate})
        .to(target,{x: isMobile ? 0 : -0.01, y: isMobile ? 0.5 : 0.89, z: -0.09, duration: 1.5}, '-=1.5')
        
        if (document.querySelector('.footer--menu li.active')){
            document.querySelector('.footer--menu li.active')?.classList.remove('active')
        }
        configGem.parentElement?.classList.add('active')
    })

    // DIAMOND COLORS
    document.querySelector('.ruby')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#f70db1'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.ruby')?.classList.add('active')
    })
    document.querySelector('.faint')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#CFECEC'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.faint')?.classList.add('active')
     })
     document.querySelector('.fancy')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#a9cbe2'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.fancy')?.classList.add('active')
     })
     
     document.querySelector('.aqua')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#62cffe'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.aqua')?.classList.add('active')
     })
     document.querySelector('.swiss')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#76dce4'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.swiss')?.classList.add('active')
     })
     document.querySelector('.yellow')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#efe75b'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.yellow')?.classList.add('active')
     })
     document.querySelector('.orange')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#eb8e17'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.orange')?.classList.add('active')
     })
     document.querySelector('.green')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#17ebb5'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.green')?.classList.add('active')
     })
     document.querySelector('.emerald')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#5eca00'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.emerald')?.classList.add('active')
     })
     document.querySelector('.rose')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#fa37d7'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.rose')?.classList.add('active')
     })
     document.querySelector('.violet')?.addEventListener('click', () => {
        changeDiamondColor(new Color('#c200f2'))
        document.querySelector('.colors--list li.active')?.classList.remove('active')
        document.querySelector('.violet')?.classList.add('active')
     })

    // CHANGE DIAMOND COLOR
    function changeDiamondColor(_gemColor: Color){
        for (const o of diamondObjects) {
            o.material.color = _gemColor
        }
        usingCustomColors = true
    }


    // MATERIALS MENU
    configMaterial.addEventListener('click', () => {
        materialsMenu.classList.add('show')
        gemMenu.classList.remove('show')
        gsap.timeline().to(position,{x: -0.17, y: -0.25, z: 8.5, duration: 2.5, onUpdate})
        .to(target, {x: 0, y: 0, z: 0, duration: 2.5, onUpdate}, '-=2.5')
        
        if (document.querySelector('.footer--menu li.active')){
            document.querySelector('.footer--menu li.active')?.classList.remove('active')
        }
        configMaterial.parentElement?.classList.add('active')
    })

    // MATERIALS COLOR
    document.querySelector('.default')?.addEventListener('click', () => {
        changeMaterialColor(new Color(0xfea04d),new Color(0xffffff))
        document.querySelector('.materials--list li.active')?.classList.remove('active')
        document.querySelector('.default')?.classList.add('active')
     })
    document.querySelector('.silver-gold')?.addEventListener('click', () => {
        changeMaterialColor(new Color(0xffffff), new Color(0xfea04d))
        document.querySelector('.materials--list li.active')?.classList.remove('active')
        document.querySelector('.silver-gold')?.classList.add('active')
     })
     
    document.querySelector('.silver-silver')?.addEventListener('click', () => {
        changeMaterialColor(new Color(0xffffff), new Color(0xffffff))
        document.querySelector('.materials--list li.active')?.classList.remove('active')
        document.querySelector('.silver-silver')?.classList.add('active')
     })
    
    document.querySelector('.gold-gold')?.addEventListener('click', () => {
        changeMaterialColor(new Color(0xfea04d), new Color(0xfea04d))
        document.querySelector('.materials--list li.active')?.classList.remove('active')
        document.querySelector('.gold-gold')?.classList.add('active')
     })
    document.querySelector('.rose-silver')?.addEventListener('click', () => {
        changeMaterialColor(new Color(0xfa8787), new Color(0xffffff))
        document.querySelector('.materials--list li.active')?.classList.remove('active')
        document.querySelector('.rose-silver')?.classList.add('active')
    })
    document.querySelector('.gold-rose')?.addEventListener('click', () => {
        changeMaterialColor(new Color(0xfea04d), new Color(0xfa8787))
        document.querySelector('.materials--list li.active')?.classList.remove('active')
        document.querySelector('.gold-rose')?.classList.add('active')
    })
    document.querySelector('.rose-rose')?.addEventListener('click', () => {
        changeMaterialColor(new Color(0xfa8787), new Color(0xfa8787))
        document.querySelector('.materials--list li.active')?.classList.remove('active')
        document.querySelector('.rose-rose')?.classList.add('active')
    })

    // CHANGE MATERIAL COLOR
    function changeMaterialColor(_firstColor: Color, _secondColoor: Color){
        silver.material.color = _firstColor
        gold.material.color = _secondColoor
        usingCustomColors = true
    }

    // CLOSE GEM MENU
    closeConfigGem.addEventListener('click', () => {
        gemMenu.classList.remove('show')

        gsap.timeline().to(position,{x: -0.17, y: -0.25, z: 8.5, duration: 2.5, onUpdate})
        .to(target, {x: 0, y: 0, z: 0, duration: 2.5, onUpdate}, '-=2.5')
       
        if (document.querySelector('.footer--menu li.active')){
            document.querySelector('.footer--menu li.active')?.classList.remove('active')
        }
    })

    // CLOSE MATERIAL MENU
    closeConfigMaterial.addEventListener('click', () => {
        materialsMenu.classList.remove('show')
       
        if (document.querySelector('.footer--menu li.active')){
            document.querySelector('.footer--menu li.active')?.classList.remove('active')
        }
    })

    // CHANGE RING
    configRing.addEventListener('click', () => {

        gsap.to('.loader', {x: '0%', duration: 0.8, ease: "power4.inOut", onComplete: () =>{
            loadNewModel()
        }})
           
        if (document.querySelector('.footer--menu li.active')){
            document.querySelector('.footer--menu li.active')?.classList.remove('active')
        }
    })

    async function loadNewModel(){
        if(ringModel == 1){
            viewer.scene.removeSceneModels()
            await manager.addFromPath("./assets/ring2_webgi.glb")
            gsap.to('.loader', {x: '100%', duration: 0.8, ease: "power4.inOut", delay: 1})

            viewer.setBackground(new Color('#EEB7B5').convertSRGBToLinear())
    
            ring = viewer.scene.findObjectsByName('Scene_1')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
            silver = viewer.scene.findObjectsByName('alliance')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
            gold = viewer.scene.findObjectsByName('entourage')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
            
            // ring.rotation.set(Math.PI/2, 0, 0)
            diamondObjects.length = 0
    
            for (const obj of diamondsObjectNames2) {
                const o = viewer.scene.findObjectsByName(obj)[0]
                diamondObjects.push(o)
            }
    
            ringModel = 2
            if(camera.controls){
                camera.controls.autoRotate = true
                camera.controls.minDistance = 5
                camera.controls.maxDistance = 13
                camera.controls.enablePan = false
                camera.controls.screenSpacePanning = false
            }


        }else{
            viewer.scene.removeSceneModels()
            await manager.addFromPath("./assets/ring_webgi.glb")
            gsap.to('.loader', {x: '100%', duration: 0.8, ease: "power4.inOut", delay: 1})

            ring = viewer.scene.findObjectsByName('Scene')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
            silver = viewer.scene.findObjectsByName('silver')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>
            gold = viewer.scene.findObjectsByName('gold')[0] as any as Mesh<BufferGeometry,MeshStandardMaterial2>

            ring.rotation.set(-Math.PI/2, 0, 0)
            diamondObjects.length = 0

            for (const obj of diamondsObjectNames) {
                const o = viewer.scene.findObjectsByName(obj)[0]
                diamondObjects.push(o)
            }

            ringModel = 1

            if(camera.controls){
                camera.controls.autoRotate = true
                camera.controls.minDistance = 5
                camera.controls.maxDistance = 13
                camera.controls.enablePan = false
                camera.controls.screenSpacePanning = false
            }
        }
        
    }
}



/////////////////////////////////////////////////////////////////////////
///// BACKGROUND MUSIC
let firstPlay = true
let audio = new Audio();
audio.src = './assets/sounds/music_loop.mp3'
let musicPlay = false
function playMusic() {
    if (!musicPlay) {
        audio.play()
        audio.volume = 0.1
        audio.loop = true
        musicPlay = true
    } else {
        audio.pause()
        musicPlay = false
    }
}

document.querySelector('.music--control')?.addEventListener('click', () => {
    playMusic()
})

document.querySelector('.music--control--2')?.addEventListener('click', () => {
    playMusic()
})

/////////////////////////////////////////////////////////////////////////
///// CUSTOMIZATION DATA MANAGEMENT WITH LOCALSTORAGE

interface CustomizationData {
    gemColor: string;
    material: string;
    engravingText: string;
    timestamp: number;
}

function saveCustomization(data: CustomizationData) {
    localStorage.setItem('ringCustomization', JSON.stringify(data));
}

function loadCustomization(): CustomizationData | null {
    const data = localStorage.getItem('ringCustomization');
    return data ? JSON.parse(data) : null;
}

function getCurrentGemColor(): string {
    const activeGem = document.querySelector('.colors--list li.active');
    if (!activeGem) return 'ruby';
    return activeGem.className.replace('active', '').trim();
}

function getCurrentMaterial(): string {
    const activeMaterial = document.querySelector('.materials--list li.active');
    if (!activeMaterial) return 'default';
    return activeMaterial.className.replace('active', '').trim();
}

/////////////////////////////////////////////////////////////////////////
///// COMPLETION BUTTON AND MODAL HANDLERS

const configComplete = document.querySelector('.config--complete') as HTMLElement;
const engravingModal = document.getElementById('engravingModal') as HTMLElement;
const btnCancel = document.getElementById('btnCancel') as HTMLElement;
const btnConfirm = document.getElementById('btnConfirm') as HTMLElement;
const engravingTextInput = document.getElementById('engravingText') as HTMLTextAreaElement;
const customLoader = document.getElementById('customLoader') as HTMLElement;
const completionScreen = document.getElementById('completionScreen') as HTMLElement;
const btnCloseCompletion = document.getElementById('btnCloseCompletion') as HTMLElement;
const displayEngravingText = document.getElementById('displayEngravingText') as HTMLElement;
const btnShare = document.getElementById('btnShare') as HTMLElement;
const previewCanvas = document.getElementById('preview-canvas') as HTMLCanvasElement;

// Show modal when completion button clicked
configComplete?.addEventListener('click', () => {
    engravingModal.classList.add('show');
    engravingTextInput.value = '';
    engravingTextInput.focus();
});

// Close modal on cancel
btnCancel?.addEventListener('click', () => {
    engravingModal.classList.remove('show');
});

// Close modal on outside click
engravingModal?.addEventListener('click', (e) => {
    if (e.target === engravingModal) {
        engravingModal.classList.remove('show');
    }
});

// Confirm and show loading
btnConfirm?.addEventListener('click', () => {
    const engravingText = engravingTextInput.value.trim();

    if (!engravingText) {
        alert('请输入刻字内容');
        return;
    }

    // Hide modal
    engravingModal.classList.remove('show');

    // Show loading
    customLoader.classList.add('show');

    // Save customization data
    const customizationData: CustomizationData = {
        gemColor: getCurrentGemColor(),
        material: getCurrentMaterial(),
        engravingText: engravingText,
        timestamp: Date.now()
    };
    saveCustomization(customizationData);

    // Simulate loading time
    setTimeout(() => {
        customLoader.classList.remove('show');
        showCompletionScreen(customizationData);
    }, 2500);
});

// Show completion screen
function showCompletionScreen(data: CustomizationData) {
    displayEngravingText.textContent = data.engravingText;

    // Draw preview on canvas
    drawRingPreview(data);

    // Show completion screen
    completionScreen.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close completion screen
btnCloseCompletion?.addEventListener('click', () => {
    completionScreen.classList.remove('show');
    document.body.style.overflow = '';
});

// Draw ring preview on canvas
function drawRingPreview(data: CustomizationData) {
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    const width = previewCanvas.width = 400;
    const height = previewCanvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(240, 220, 220, 0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw simplified ring representation
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Ring band
    ctx.strokeStyle = getMaterialColor(data.material);
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Inner shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Gem
    ctx.fillStyle = getGemColor(data.gemColor);
    ctx.beginPath();
    ctx.moveTo(0, -100);
    ctx.lineTo(-15, -70);
    ctx.lineTo(-10, -50);
    ctx.lineTo(10, -50);
    ctx.lineTo(15, -70);
    ctx.closePath();
    ctx.fill();

    // Gem outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gem sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(-5, -75, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Display customization info
    ctx.fillStyle = '#52322B';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`材质: ${getMaterialName(data.material)}`, width / 2, height - 50);
    ctx.fillText(`宝石: ${getGemName(data.gemColor)}`, width / 2, height - 30);
}

// Helper functions for colors and names
function getMaterialColor(material: string): string {
    const colors: {[key: string]: string} = {
        'default': '#fea04d',
        'silver-gold': '#d4d4d4',
        'silver-silver': '#e8e8e8',
        'gold-gold': '#fea04d',
        'rose-silver': '#f5c5c5',
        'gold-rose': '#fea04d',
        'rose-rose': '#f5a5a5'
    };
    return colors[material] || '#fea04d';
}

function getGemColor(gemColor: string): string {
    const colors: {[key: string]: string} = {
        'ruby': '#f70db1',
        'faint': '#CFECEC',
        'fancy': '#a9cbe2',
        'aqua': '#62cffe',
        'swiss': '#76dce4',
        'yellow': '#efe75b',
        'orange': '#eb8e17',
        'green': '#17ebb5',
        'emerald': '#5eca00',
        'rose': '#fa37d7',
        'violet': '#c200f2'
    };
    return colors[gemColor] || '#f70db1';
}

function getMaterialName(material: string): string {
    const names: {[key: string]: string} = {
        'default': '金银混搭',
        'silver-gold': '银金混搭',
        'silver-silver': '纯银',
        'gold-gold': '纯金',
        'rose-silver': '玫瑰银',
        'gold-rose': '金玫瑰',
        'rose-rose': '玫瑰金'
    };
    return names[material] || '金银混搭';
}

function getGemName(gemColor: string): string {
    const names: {[key: string]: string} = {
        'ruby': '红宝石',
        'faint': '淡蓝宝石',
        'fancy': '幻彩蓝宝石',
        'aqua': '海蓝宝石',
        'swiss': '瑞士蓝宝石',
        'yellow': '黄宝石',
        'orange': '橙宝石',
        'green': '绿宝石',
        'emerald': '祖母绿',
        'rose': '粉宝石',
        'violet': '紫宝石'
    };
    return names[gemColor] || '红宝石';
}

/////////////////////////////////////////////////////////////////////////
///// WECHAT SHARING (WITHOUT SDK)

btnShare?.addEventListener('click', async () => {
    const shareData = {
        title: '致筱雅 · 永恒的誓言',
        text: '为闫筱雅定制的专属爱情信物',
        url: window.location.href
    };

    // Try native Web Share API first
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showShareSuccess();
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                showShareInstructions();
            }
        }
    } else {
        // Fallback: copy link to clipboard
        try {
            await navigator.clipboard.writeText(window.location.href);
            showShareFallback();
        } catch (err) {
            showShareInstructions();
        }
    }
});

function showShareSuccess() {
    showToast('分享成功！');
}

function showShareFallback() {
    showToast('链接已复制到剪贴板，请在微信中粘贴分享');
}

function showShareInstructions() {
    alert('请点击浏览器的分享按钮，选择微信进行分享');
}

function showToast(message: string) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeInOut 2s ease-in-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        document.body.removeChild(toast);
        document.head.removeChild(style);
    }, 2000);
}

setupViewer()
