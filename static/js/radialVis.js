/**
 * @class RadialVis
 */
class RadialVis {

    // Vars
    data = [];
    data_keys = [];
    filters = null;

    // Elements
    svg = null;
    g = null;
    radialG = null;
    labelsG = null;
    areasG = null;
    overlaysG = null;
    overlayTextGMid = null;
    overlayTextGTop = null;
    labelGCircMid = null;
    labelGCircTop = null;
    overlayResultG = null;
    radialSel = null;

    // Configs
    svgW = 600;
    svgH = 600;
    gMargin = {top: 100, right: 100, bottom: 100, left: 100};
    gW = this.svgW - (this.gMargin.right + this.gMargin.left);
    gH = this.svgH - (this.gMargin.top + this.gMargin.bottom);
    rLg = this.gW / 2;
    rSm = this.gW / 2 - this.rLg * 0.5;

    // Tools
    anglesScale = d3.scaleLinear()
        .range([0, 2 * Math.PI]);
    coordsScale = d3.scaleLinear()
        .range([Math.PI, -Math.PI]);
    colorsScale = d3.scaleOrdinal();
    radiusScale = d3.scaleLinear()
        .range([this.rSm, this.rLg])
        .domain([0, 1]);
    areaMaker = d3.areaRadial()
        .curve(d3.curveCardinal)
        .innerRadius(d => this.radiusScale(d[0]))
        .outerRadius(d => this.radiusScale(d[1]))
        .angle(d => this.anglesScale(d[2]));

    /**
     * @constructor
     */
    constructor(_target) {
        // Assign parameters as object fields
        this.target = _target;

        // Now init
        this.init();
    }

    /**
     * 1.
     * @function init
     * Initializes vis (one time operations)
     *
     * @returns void
     */
    init() {
        // Define this vis
        const vis = this;

        // Set up the svg/g work space
        vis.svg = d3.select(`#${vis.target}`)
            .append('svg')
            .attr('width', vis.svgW)
            .attr('height', vis.svgH);
        vis.g = vis.svg.append('g')
            .attr('class', 'container')
            .style('transform', `translate(${vis.gMargin.left}px, ${vis.gMargin.top}px)`);

        // Append groups
        vis.radialG = vis.g.append('g')
            .attr('class', 'radialG')
            .style('transform', `translate(${vis.gW / 2}px, ${vis.gH / 2}px)`);
        vis.labelsG = vis.radialG.append('g')
            .attr('class', 'labelsG')
            .classed('hideable', true)
            .classed('hidden', true);
        vis.labelGCircMid = vis.labelsG.append('circle')
            .attr('fill', 'none')
            .attr('stroke', 'rgba(0, 0, 0, 0.25)')
            .attr('stroke-width', 0.5);
        vis.labelGCircTop = vis.labelsG.append('circle')
            .attr('fill', 'none')
            .attr('stroke', 'rgba(0, 0, 0, 0.25)')
            .attr('stroke-width', 0.5);
        vis.areasG = vis.radialG.append('g')
            .attr('class', 'areasG');
        vis.overlaysG = vis.radialG.append('g')
            .attr('class', 'overlaysG')
            .classed('hideable', true)
            .classed('hidden', true);
        vis.overlayTextGMid = vis.overlaysG.append('g')
            .attr('class', 'overlayTextG overlayTextGMid')
            .attr('x', 0)
            .attr('y', 0);
        vis.overlayTextGMid.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 11)
            .attr('font-weight', 'bold')
            .text('50%');
        vis.overlayTextGTop = vis.overlaysG.append('g')
            .attr('class', 'overlayTextG overlayTextGMid')
            .attr('x', 0)
            .attr('y', 0);
        vis.overlayTextGTop.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 11)
            .attr('font-weight', 'bold')
            .text('100%');
        vis.overlayResultG = vis.overlaysG.append('g')
            .attr('class', 'overlayResultG');
        vis.overlayResultG.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-family', 'Playfair Display')
            .attr('font-size', 17)
            .attr('font-weight', 900);

        // Other useful elements
        vis.radialSel = d3.select('#radialSel')
            .classed('hideable', true)
            .classed('hidden', true);

        // Initialize some

    }

    /**
     * 2.
     * @function wrangle
     * Wrangles data and updates configs and tools before rendering
     *
     * @returns void
     */
    wrangle(data = this.data) {
        // Define this vis
        const vis = this;

        // Import new data and filters
        vis.data = data;
        vis.filters = main_filters;

        // Create new data structure from keys with values contain answers
        vis.data_keys = [];
        let index = 0;
        for (let k in vis.data[0]) {
            const keySplit = k.split(' - ');
            if (keySplit[0] === vis.filters.target || keySplit[0] === 'Total') {
                vis.data_keys.push({
                    key: keySplit[1],
                    index: index,
                    values: []
                })
                index++;
            }
        }
        const answers = Array.from(new Set(vis.data.map(d => d['Answer'])))
        vis.data_keys.forEach(k => {
            answers.forEach((a, i) => {
                const obj = {
                    answer: a,
                    index: i
                };
                const filtered = vis.data.filter(d => d['Answer'] === a);
                filtered.forEach(f => {
                    const unit = f['Unit'];
                    let targetKey = vis.filters.target + ' - ' + k.key;
                    if (!f.hasOwnProperty(targetKey)) targetKey = `Total - Total`;

                    if (unit === 'ct') {
                        obj.count = f[targetKey] ? f[targetKey] : '0';
                    } else if (unit === 'pct') {
                        obj.percent = f[targetKey] ? f[targetKey] : '0';
                    }
                });
                k.values.push(JSON.parse(JSON.stringify(obj)));
            });
            k.values.sort((a, b) => b.percent - a.percent);
        });

        // Update scales
        vis.coordsScale.domain([0, vis.data_keys.length * 2]);
        vis.anglesScale.domain([0, vis.data_keys.length * 2]);
        if (vis.filters.question === 'go_vote') {
            vis.radiusScale.domain([0, 0.5]);
            vis.colorsScale
                .domain(['0_very_uncomfortable', '1_uncomfortable', '2_slightly_uncomfortable',
                    '3_slightly_comfortable', '4_comfortable', '5_very_comfortable',
                    'dont_know'])
                .range(['rgb(255,0,0)', 'rgb(250,123,123)', 'rgb(248,164,164)',
                    'rgb(184,182,224)', 'rgb(139,135,208)', 'rgb(81, 71, 219)',
                    'rgb(252,201,149)']);
        } else {
            vis.radiusScale.domain([0, 1]);
            vis.colorsScale.domain(['unsafe', 'safe', 'dont_know'])
                .range(['rgb(255,0,0)', 'rgb(81, 71, 219)', 'rgb(252,201,149)']);
        }

        // Now render
        vis.render();
    }

    /**
     * 3.
     * @function render
     * Renders the visualization in the DOM
     *
     * @returns void
     */
    render() {
        // Define this vis
        const vis = this;

        // Build overlay
        // Calc
        const textRMid = this.radiusScale(0.5);
        const textRTop = this.radiusScale(1);
        const textPos = this.data_keys.length * 2 - 1;
        const textDeg = 180 - this.coordsScale(textPos) * 180 / Math.PI;
        const textCoordsMid = getCoordsTranslation(textRMid, textPos);
        const textCoordsTop = getCoordsTranslation(textRTop, textPos);
        // Percent labels
        vis.overlayTextGMid.transition()
            .style('transform', `translate(${textCoordsMid[0]}px, ${textCoordsMid[1]}px)`);
        vis.overlayTextGMid.select('text').style('transform', `rotate(${textDeg}deg)`);
        vis.overlayTextGTop.transition()
            .style('transform', `translate(${textCoordsTop[0]}px, ${textCoordsTop[1]}px)`);
        vis.overlayTextGTop.select('text').style('transform', `rotate(${textDeg}deg)`);
        // Percent circs
        vis.labelGCircMid.transition().attr('r', textRMid);
        vis.labelGCircTop.transition().attr('r', textRTop);
        // Set prev
        vis.prevFilterQuestion = vis.filters.question;

        // Build labels
        vis.labelsG.selectAll('.labelG')
            .data(vis.data_keys, d => d.index)
            .join(
                enter => enter
                    .append('g')
                    .attr('class', 'labelG')
                    .each(function (d, i) {
                        const g = d3.select(this);
                        const pos = i * 2;
                        // Line
                        const coords = [
                            getCoordsTranslation(vis.rLg - 5, pos),
                            getCoordsTranslation(vis.rLg + 5, pos)
                        ];
                        const labelLine = g.append('path')
                            .attr('class', 'labelLine')
                            .attr('stroke', 'rgba(0, 0, 0, 1)');
                        labelLine.transition()
                            .attr('d', d3.line()(coords))
                        // Text and tspans
                        const textCoords = getCoordsTranslation(vis.rLg + 15, pos)
                        const text = g.append('text')
                            .attr('class', 'labelText')
                            .attr('dominant-baseline', () => {
                                if (textCoords[1] > 0) {
                                    return 'hanging';
                                } else if (textCoords[1] < 0) {
                                    return 'baseline';
                                }
                                return 'middle'
                            });
                        const spans = wrapText(d);
                        spans.forEach((s, i) => {
                            text.append('tspan')
                                .attr('dy', 13 * i)
                                .attr('x', textCoords[0])
                                .attr('y', textCoords[1])
                                .attr('text-anchor', () => {
                                    if (textCoords[0] > 0) {
                                        return 'start';
                                    } else if (textCoords[0] < 0) {
                                        return 'end';
                                    }
                                    return 'middle';
                                })
                                .attr('font-family', 'sans-serif')
                                .attr('font-size', '11px')
                                .attr('font-weight', 'lighter')
                                .text(s)
                        })
                    }),
                update => update
                    .each(function (d, i) {
                        const g = d3.select(this);
                        const pos = i * 2
                        // Line
                        const coords = [
                            getCoordsTranslation(vis.rLg - 5, pos),
                            getCoordsTranslation(vis.rLg + 5, pos)
                        ];
                        g.select('.labelLine')
                            .attr('d', d3.line()(coords));
                        // Text and tspans
                        const textCoords = getCoordsTranslation(vis.rLg + 15, pos)
                        const text = g.select('.labelText')
                            .attr('dominant-baseline', () => {
                                if (textCoords[1] > 0) {
                                    return 'hanging';
                                } else if (textCoords[1] < 0) {
                                    return 'baseline';
                                }
                                return 'middle'
                            });
                        text.selectAll('tspan').remove();
                        const spans = wrapText(d);
                        spans.forEach((s, i) => {
                            text.append('tspan')
                                .attr('dy', 13 * i)
                                .attr('x', textCoords[0])
                                .attr('y', textCoords[1])
                                .attr('text-anchor', () => {
                                    if (textCoords[0] > 0) {
                                        return 'start';
                                    } else if (textCoords[0] < 0) {
                                        return 'end';
                                    }
                                    return 'middle';
                                })
                                .attr('font-family', 'sans-serif')
                                .attr('font-size', '11px')
                                .attr('font-weight', 'lighter')
                                .text(s)
                        })
                    }),
                exit => exit.remove()
            );

        // Build areas
        vis.areasG.selectAll('.areaG')
            .data(vis.data_keys, d => d.index)
            .join(
                enter => enter
                    .append('g')
                    .attr('class', 'areaG')
                    .each(function (d, i) {
                        const g = d3.select(this);
                        evalSecondJoin(g, i, d.values);
                        // Text
                        const pos = i * 2;
                        const coords = getCoordsTranslation(vis.rSm - 25, pos);
                        g.append('text')
                            .attr('class', `areaText areaTextTop`)
                            .attr('x', coords[0])
                            .attr('y', coords[1])
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'middle')
                            .attr('font-family', 'sans-serif')
                            .attr('font-size', 11);
                        g.append('text')
                            .attr('class', `areaText areaTextBot`)
                            .attr('x', coords[0] - 1)
                            .attr('y', coords[1])
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'middle')
                            .attr('fill', 'rgba(0, 0, 0, 0.75)')
                            .attr('font-family', 'sans-serif')
                            .attr('font-size', 9)
                            .attr('font-style', 'italic');
                    }),
                update => update.each(function (d, i) {
                    const g = d3.select(this);
                    evalSecondJoin(g, i, d.values);
                    // Text
                    const pos = i * 2;
                    const coords = getCoordsTranslation(vis.rSm - 25, pos);
                    g.selectAll('.areaText')
                        .datum(d)
                        .attr('x', coords[0])
                        .attr('y', coords[1]);
                }),
                exit => exit.remove()
            );


        /*
        aux func :: evalSecondJoin
         */
        function evalSecondJoin(g, index, data) {

            // Build path areas
            g.selectAll('.areaPath')
                .data(data, d => d.index)
                .join('path')
                .each(function (d, i) {
                    const path = d3.select(this)
                        .attr('class', `areaPath areaPath_${d.answer}`);
                    const pos = index * 2;
                    const len = data.length;
                    const start = vis.filters.question === 'go_vote' ? 0.1 : 0.2;
                    const inc = vis.filters.question === 'go_vote' ? 0.07 : 0.1;
                    const curve = len - i % len;
                    const areaD = [
                        [0, 0, pos - 1],
                        [0, +d.percent * 0.25, pos - (start + curve * inc)],
                        [0, +d.percent, pos],
                        [0, +d.percent * 0.25, pos + (start + curve * inc)],
                        [0, 0, pos + 1],
                    ];
                    path.transition()
                        .attr('d', vis.areaMaker(areaD))
                        .attr('fill', vis.colorsScale(d.answer));
                })
                .on('mouseover', function (e, d) {
                    // Path
                    d3.selectAll('.areaPath')
                        .attr('opacity', 0.2);
                    d3.selectAll(`.areaPath_${d.answer}`)
                        .attr('opacity', 0.7)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 0.1);
                    d3.select(this)
                        .attr('opacity', 1);
                    // Text
                    d3.selectAll('.areaTextTop')
                        .attr('opacity', 0.7)
                        .text(function (dd) {
                            const textTop = d3.select(this);
                            const found = dd.values.find(ddd => ddd.index === d.index);
                            if (found) {
                                if (d.percent === found.percent) {
                                    textTop.attr('dy', 0)
                                        .attr('font-size', 13)
                                        .attr('font-weight', 'bold');
                                    return d3.format('.1%')(+found.percent);
                                } else {
                                    textTop.attr('dy', -6);
                                    d3.select(this.parentElement).select('.areaTextBot')
                                        .attr('dy', 6)
                                        .attr('opacity', 0.7)
                                        .text(() => {
                                            const diff = +found.percent - +d.percent;
                                            if (diff > 0) {
                                                return '+' + d3.format('.1%')(diff);
                                            } else {
                                                return d3.format('.1%')(diff);
                                            }
                                        });
                                    return d3.format('.1%')(+found.percent);
                                }
                            }
                            return '';
                        });
                    // Result
                    let result = '';
                    if (vis.filters.question === 'go_vote') {

                    } else {
                        if (d.answer === 'safe') {
                            result = 'safe'
                        } else if (d.answer === 'unsafe') {
                            result = 'unsafe'
                        } else if (d.answer === 'dont_know') {
                            result = 'unsure';
                        }
                    }
                    vis.overlayResultG.select('text').text(result);
                })
                .on('mouseout', (e, d) => {
                    // Path
                    d3.selectAll('.areaPath')
                        .attr('opacity', 1)
                        .attr('stroke', 'none')
                        .attr('stroke-width', 0);
                    // Text
                    d3.selectAll('.areaText')
                        .attr('font-size', 11)
                        .attr('font-weight', 'normal')
                        .text('');
                    // Result
                    vis.overlayResultG.select('text').text('');
                });
        }

        /*
        aux func :: getCoordsTranslation
         */
        function getCoordsTranslation(r, pos) {
            const x = Math.round(r * Math.sin(vis.coordsScale(pos)));
            const y = Math.round(r * Math.cos(vis.coordsScale(pos)));
            return [x, y];
        }

        /*
        aux func :: wrapText
         */
        function wrapText(d) {
            let text = d.key
            let num = 0;
            d.values.forEach(v => {
                num += +v.count;
            })
            text += ` (${Math.round(num)})`
            const maxChar = 20;
            const split = text.split(' ');
            const spans = [''];
            let counter = 0;
            split.forEach(w => {
                if (counter + w.length <= maxChar) {
                    spans[spans.length - 1] += (spans[spans.length - 1] === '' ? '' : ' ') + w;
                    spans[spans.length - 1] = spans[spans.length - 1].trim()
                    counter += w.length;
                } else {
                    spans.push(w);
                    counter = w.length;
                }
            });
            return spans;
        }

    }

    /**
     * @function manage_visibility
     *
     * @param {boolean} on
     */
    manage_visibility(on) {
        this.labelsG.classed('hidden', !on);
        this.overlaysG.classed('hidden', !on);
        this.radialSel.classed('hidden', !on);
    }

}