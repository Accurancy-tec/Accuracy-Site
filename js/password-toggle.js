// Adds a show/hide button to every password field marked with data-password-toggle.
(function () {
    "use strict";

    const SVG_NS = "http://www.w3.org/2000/svg";
    const ICONS = {
        show: "M12 5C6.5 5 2.7 9.2 1.5 12c1.2 2.8 5 7 10.5 7s9.3-4.2 10.5-7C21.3 9.2 17.5 5 12 5zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
        hide: "M2.3 3.7 3.7 2.3l18 18-1.4 1.4-3.4-3.4A11.5 11.5 0 0 1 12 19C6.5 19 2.7 14.8 1.5 12a13 13 0 0 1 4.2-5.4L2.3 3.7zM12 5c5.5 0 9.3 4.2 10.5 7a13 13 0 0 1-3.1 4.3l-3-3A4.5 4.5 0 0 0 10.7 7.6L8.4 5.3A11 11 0 0 1 12 5zm-4.4 4.6a4.5 4.5 0 0 0 6.8 6.8l-1.5-1.5a2.5 2.5 0 0 1-3.8-3.8L7.6 9.6z"
    };

    function icon(name) {
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", ICONS[name]);
        svg.appendChild(path);
        return svg;
    }

    document.querySelectorAll("input[data-password-toggle]").forEach(input => {
        const wrapper = document.createElement("span");
        wrapper.className = "password-field";
        wrapper.style.marginBottom = getComputedStyle(input).marginBottom;
        input.style.marginBottom = "0";
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "password-toggle";
        button.setAttribute("aria-label", "Mostrar senha");
        button.setAttribute("aria-pressed", "false");
        button.appendChild(icon("show"));
        button.addEventListener("click", () => {
            const visible = input.type === "password";
            input.type = visible ? "text" : "password";
            button.replaceChildren(icon(visible ? "hide" : "show"));
            button.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
            button.setAttribute("aria-pressed", String(visible));
            input.focus({ preventScroll: true });
        });
        wrapper.appendChild(button);
    });
})();
