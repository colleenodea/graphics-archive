var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var data = {
    'retailer': [
        { 'label': 'Convenience stores', 'amt': 63.4 },
        { 'label': 'Tobacco specialists', 'amt': 21.1 },
        { 'label': 'Supermarkets & discounters', 'amt': 10.1 },
        { 'label': 'Drugstores', 'amt': 3.6 },
        { 'label': 'Other', 'amt': 1.9 },
    ]
};


/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    var $charts = $('#graphic');
    var bar_height = 25;
    var bar_gap = 10;
    
    function drawGraphic(width) {
        // clear out existing graphics
        $charts.empty();

        drawChart('retailer', width);
    }
    
    function drawChart(id, width) {
        var chart_data = data[id];
        var num_bars = chart_data.length;
        
        var tick_count = 7;
        if (width <= 480) {
            tick_count = 3;
        }
        
        var margin = { top: 10, right: 7, bottom: 35, left: 165 };
        var width = width - margin.left - margin.right;
        var height = ((bar_height + bar_gap) * num_bars);
        
        var x = d3.scale.linear()
            .domain([0, 70])
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);
        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(tick_count);
            
        var x_axis_grid = function() { return xAxis; }
        
        var svg = d3.select('#graphic').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'x grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(x_axis_grid()
                .tickSize(-height, 0, 0)
                .tickFormat('')
            );

        svg.append('g')
            .attr('class', 'bars')
            .selectAll('rect')
                .data(chart_data)
            .enter().append('rect')
                .attr("y", function(d, i) { return i * (bar_height + bar_gap); })
                .attr("width", function(d){ return x(d.amt); })
                .attr("height", bar_height)
                .attr('class', function(d) { return 'bar-' + d.label.replace(/\s+/g, '-').toLowerCase() });
        
        svg.append('g')
            .attr('class', 'value')
            .selectAll('text')
                .data(chart_data)
            .enter().append('text')
                .attr('x', function(d) { return x(d.amt) })
                .attr('y', function(d, i) { return i * (bar_height + bar_gap); })
                .attr('dx', 6)
                .attr('dy', 17)
                .attr('text-anchor', 'start')
                .attr('class', function(d) { return 'l-' + d.label.replace(/\s+/g, '-').toLowerCase() })
                .text(function(d) { return d.amt + '%' });
        
        svg.append('g')
            .attr('class', 'label')
            .selectAll('text')
                .data(chart_data)
            .enter().append('text')
                .attr('x', 0)
                .attr('y', function(d, i) { return i * (bar_height + bar_gap); })
                .attr('dx', -6)
                .attr('dy', 17)
                .attr('text-anchor', 'end')
                .attr('class', function(d) { return 'l-' + d.label.replace(/\s+/g, '-').toLowerCase() })
                .text(function(d) { return d.label });

        /* update responsive iframe */
        sendHeightToParent();
    }

    function setup() {
        if (Modernizr.svg) {
            setupResponsiveChild({
                renderCallback: drawGraphic 
            });
        } else {
            setupResponsiveChild();
        }
    }

    setup();
})
