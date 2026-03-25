export default function scriptjs(src: string | string[], func?: () => void) {
    const scripts = Array.isArray(src) ? src : [src];
    let loaded = 0;

    scripts.forEach(s => {
        const script = document.createElement('script');
        script.src = s;
        script.async = true;
        script.onload = () => {
            loaded++;
            if (loaded === scripts.length && func) func();
        };
        document.head.appendChild(script);
    });
}
