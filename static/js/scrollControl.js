/**
 * @class ScrollControl
 */
class ScrollControl {


    /**
     * @constructor
     */
    constructor(_targets) {
        this.targets = _targets;

        // Init
        this.init();
    }

    /**
     * 1.
     * @function init
     */
    init() {
        this.targets.forEach(t => {
            this.add_listener(t);
        });
    }

    /**
     * @function add_listener
     */
    add_listener(t) {
        if (t.task === 'scroll_start_on_to_off_bottom') {
            this.scroll_start_on_to_off_bottom(null, t);
            window.addEventListener('scroll', e => this.scroll_start_on_to_off_bottom(e, t));
        } else if (t.task === 'scroll_start_on_to_off_right') {
            this.scroll_start_on_to_off_right(null, t);
            window.addEventListener('scroll', e => this.scroll_start_on_to_off_right(e, t));
        } else if (t.task === 'scroll_start_off_to_on_bottom') {
            this.scroll_start_off_to_on_bottom(null, t);
            window.addEventListener('scroll', e => this.scroll_start_off_to_on_bottom(e, t));
        } else if (t.task === 'scroll_start_off_to_on_right') {
            this.scroll_start_off_to_on_right(null, t);
            window.addEventListener('scroll', e => this.scroll_start_off_to_on_right(e, t));
        } else if (t.task === 'scroll_start_off_to_on_top') {
            this.scroll_start_off_to_on_top(null, t);
            window.addEventListener('scroll', e => this.scroll_start_off_to_on_top(e, t));
        } else if (t.task === 'scroll_in_container') {
            this.scroll_in_container(null, t);
            window.addEventListener('scroll', e => this.scroll_in_container(e, t));
        }
    }

    /**
     * @function scroll_in_container
     */
    scroll_in_container(e, t) {
        // Els
        const target = document.querySelector(`#${t.target_id}`);
        const target_rect = target.getBoundingClientRect();
        const hDiff = (window.innerHeight - target_rect.height) / 2;

        // Logic
        if (target_rect.top - window.innerHeight + hDiff < -(hDiff)
            && target_rect.top - window.innerHeight + hDiff > -(window.innerHeight - hDiff)) {
            target.style.opacity = '1';
            t.trigger(t.target_id);
        } else {
            target.style.opacity = '0.25';
        }
    }

    /**
     * @function scroll_start_off_to_on_top
     */
    scroll_start_off_to_on_bottom(e, t) {
        // Els
        const target = document.querySelector(`#${t.target_id}`);
        const target_rect = target.getBoundingClientRect();
        const determinant = document.querySelector(`#${t.determinant_id}`);
        const determinant_rect = determinant.getBoundingClientRect();

        // Logic
        if (determinant_rect.top >= 0) {
            raf(-target_rect.height);
        } else if (determinant_rect.top < 0 && determinant_rect.top > -determinant_rect.height) {
            const pct = 1 + determinant_rect.top / determinant_rect.height;
            raf(pct * -target_rect.height)
        } else {
            raf(0);
        }

        /*
        auxi func :: raf
         */
        function raf(r) {
            requestAnimationFrame(() => {
                target.style.bottom = `${r}px`;
            });
        }
    }

    /**
     * @function scroll_start_off_to_on_right
     */
    scroll_start_off_to_on_right(e, t) {
        // Els
        const target = document.querySelector(`#${t.target_id}`);
        const target_rect = target.getBoundingClientRect();
        const determinant = document.querySelector(`#${t.determinant_id}`);
        const determinant_rect = determinant.getBoundingClientRect();

        // Logic
        if (determinant_rect.top >= 0) {
            t.trigger(false)
            raf(-target_rect.width);
        } else if (determinant_rect.top < 0 && determinant_rect.top > -determinant_rect.height) {
            const pct = 1 + determinant_rect.top / determinant_rect.height;
            raf(pct * -target_rect.width)
            // Function
            if (pct < 0.15 && t.hasOwnProperty('trigger')) {
                t.trigger(true)
            } else {
                t.trigger(false)
            }
        } else {
            t.trigger(true)
            raf(0);
        }

        /*
        auxi func :: raf
         */
        function raf(r) {
            requestAnimationFrame(() => {
                target.style.right = `${r}px`;
            });
        }
    }

    /**
     * @function scroll_start_off_to_on_top
     */
    scroll_start_off_to_on_top(e, t) {
        // Els
        const target = document.querySelector(`#${t.target_id}`);
        const target_rect = target.getBoundingClientRect();
        const determinant = document.querySelector(`#${t.determinant_id}`);
        const determinant_rect = determinant.getBoundingClientRect();

        // Logic
        if (determinant_rect.top >= 0) {
            raf(-target_rect.height);
        } else if (determinant_rect.top < 0 && determinant_rect.top > -determinant_rect.height) {
            const pct = 1 + determinant_rect.top / determinant_rect.height;
            raf(pct * -target_rect.height)
        } else {
            raf(0);
        }

        /*
        auxi func :: raf
         */
        function raf(r) {
            requestAnimationFrame(() => {
                target.style.top = `${r}px`;
            });
        }
    }

    /**
     * @function scroll_start_on_to_off_right
     */
    scroll_start_on_to_off_right(e, t) {
        // Els
        const target = document.querySelector(`#${t.target_id}`);
        const target_rect = target.getBoundingClientRect();
        const determinant = document.querySelector(`#${t.determinant_id}`);
        const determinant_rect = determinant.getBoundingClientRect();

        // Logic
        if (determinant_rect.top >= 0) {
            raf(0);
        } else if (determinant_rect.top < 0 && determinant_rect.top > -determinant_rect.height) {
            const pct = determinant_rect.top / determinant_rect.height;
            raf(pct * target_rect.width)
        } else {
            raf(target_rect.width);
        }

        /*
        auxi func :: raf
         */
        function raf(r) {
            requestAnimationFrame(() => {
                target.style.right = `${r}px`;
            });
        }
    }

    /**
     * @function scroll_start_on_to_off_bottom
     */
    scroll_start_on_to_off_bottom(e, t) {
        // Els
        const target = document.querySelector(`#${t.target_id}`);
        const target_rect = target.getBoundingClientRect();
        const determinant = document.querySelector(`#${t.determinant_id}`);
        const determinant_rect = determinant.getBoundingClientRect();

        // Logic
        if (determinant_rect.top - window.innerHeight >= 0) {
            raf(0);
        } else if (determinant_rect.top - window.innerHeight < 0) {
            raf(determinant_rect.top - window.innerHeight)
        }

        /*
        auxi func :: raf
         */
        function raf(r) {
            requestAnimationFrame(() => {
                target.style.top = `${r}px`;
            });
        }
    }


}