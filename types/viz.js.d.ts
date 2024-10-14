declare module 'viz.js' {
    import { Module, render } from 'viz.js/full.render.js';

    export default class Viz {
        constructor(options?: { Module?: typeof Module, render?: typeof render });
        renderSVGElement(src: string): Promise<SVGSVGElement>;
    }
}