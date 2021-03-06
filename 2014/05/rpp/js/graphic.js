var $graphic;

var graphic_aspect_width = 1;
var graphic_aspect_height = 2;
var graphic_data;
var graphic_data_url = 'rpp3.csv';
var is_mobile;
var min_height = 610;
var mobile_threshold = 480;
var num_ticks;
var pymChild = null;
var thousandFormat = d3.format(',')
var typeahead_init = false;


var msaKeepdesk = [
    "Baltimore-Towson, MD",
    "Bloomington, IN",
    "Chicago, IL-IN-WI",
    "Corvallis, OR",
    "Danville, IL",
    "Honolulu, HI",
    "Los Angeles, CA",
    "New York City, NY",
    "Rochester, MN",
    "San Francisco",
    "Washington, DC",
    "Muncie, IN",
    "Hot Springs, AR",
    "Washington, DC",
    "Houston, TX",
    "Dallas-Fort Worth, TX"
];
var msaKeepmobile = [
    "Baltimore-Towson, MD",
    "Bloomington, IN",
    "Chicago, IL-IN-WI",
    "Corvallis, OR",
    "Danville, IL",
    "Honolulu, HI",
    "Los Angeles, CA",
    "New York City, NY",
    "Rochester, MN",
    "San Francisco",
    "Washington, DC",
    "Muncie, IN",
    "Hot Springs, AR",
    "Washington, DC"
];

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};


function test(d) {
    var testt = $('ul.typeahead li.active').data('value');
    console.log(testt);
}


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
   });
};


/*
 * Typeahead
 */
// RegExp
// ^(\w.*),+\s+(\w.*)
// for MSA
function substringMatcher(strs) {
    return function findMatches(q, cb) {
        var matches, substringRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
                // the typeahead jQuery plugin expects suggestions to a
                // JavaScript object, refer to typeahead docs for more info
                matches.push({ value: str });
            }
        });
        cb(matches);
    };
}

function on_typeahead_selected(event, selection) {
    //   .attr('class', function(d) { 
    //     return   d.key.replace(/\W+/g, '-').toLowerCase();
    // })
    // console.log(selection)

    d3.selectAll("#whitebox-revealed").attr('id','whitebox');
    d3.selectAll("#text-highlight").attr('id','blank-label');
    d3.selectAll("#line-highlight").attr('id','blank-path');

    console.log(selection.value)

    var testtt = selection.value;
    var test3 = testtt.replace(/\W+/g, '-').toLowerCase();

    console.log(test3)              

    var selectHighlight = selection.value.replace(/\W+/g, '-').toLowerCase();              

    console.log(".line." + selectHighlight)
    console.log("." + selectHighlight + "")

    d3.selectAll("." + selectHighlight )
        .attr('id','text-highlight').moveToFront();

    d3.selectAll(".box" + selectHighlight )
        .attr('id','whitebox-revealed').moveToFront();

    d3.selectAll(".line." + selectHighlight )
        .attr('id','line-highlight').moveToFront();

    d3.selectAll("#nonblank-label")
        .style('font-size', function(d) {
            if (is_mobile) {
                return "10px";
            } else {
                return "11px";
            }
        })
        .style('opacity','.5')
        .attr('dx',"0em")
        .style('stroke-width','0')
        .style('stroke',"#4F4F4F")
        .style('fill',"#4F4F4F");
}

/*
 * Mouseover/mouseout
 */
function render(width) {
    // console.log(graphic_data)
    // if (Modernizr.svg) {
        var margin = {top: 75, right: 350, bottom: 25, left: 350};
        
        if (width < mobile_threshold){
            is_mobile = true;
        } else {
            is_mobile = false;
        }

console.log(is_mobile)

        if (width < mobile_threshold) {
            var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        
            num_ticks = 5;
            margin.left = 125;
            margin.right = 125;
            is_mobile = true;
            var msaKeep = msaKeepmobile;



        } else {
            var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        
            num_ticks = 10;
            margin.left = 200;
            margin.right = 200;
            is_mobile = false;
            var msaKeep = msaKeepdesk;
        }

        var width = width - margin.left - margin.right;

        // clear out existing graphics
        $graphic.empty();

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);
        
        var line = d3.svg.line()
            .x(function(d) { return x(d.msa); })
            .y(function(d) { return y(d.amt); });


        var voronoi = d3.geom.voronoi()
            .x(function(d) { return x(d.msa); })
            .y(function(d) { return y(d.amt); });
            // .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);


        var xMap = function(d) { return d.msa;}; 
        var yMap = function(d) { return d.amt;}; 

            // var xVal = function(d) { return d.size;};

        var color = d3.scale.ordinal()
                     .range(['#6C2315', '#A23520', '#D8472B', '#E27560', '#ECA395', '#F5D1CA',
                    '#714616', '#AA6A21', '#E38D2C', '#EAAA61', '#F1C696', '#F8E2CA',
                    '#77631B',  '#B39429',  '#EFC637',  '#F3D469',  '#F7E39B',  '#FBF1CD',
                    '#0B403F',  '#11605E',  '#17807E',  '#51A09E',  '#8BC0BF',  '#C5DFDF',
                    '#28556F',  '#3D7FA6',  '#51AADE',  '#7DBFE6',  '#A8D5EF',  '#D3EAF7']); // colors


        var lines = {};
        for (var column in graphic_data[0]) {
            if (column == 'msa') continue;
            lines[column] = graphic_data.map(function(d) {
                return { 
                    'msa': d.msa, 
                    'amt': d[column]
                };
            });
        }
       
        var svg = d3.select('#graphic').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain(d3.extent(graphic_data, function(d) { return d.msa; }));

        y.domain([17500,45000])

        svg.append('g').selectAll('path')
            .data(d3.entries(lines))
            .enter()
            .append('path')
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'blank-path';
                } else {
                    return 'nonblank-path';
                }
            })            
            .attr('class', function(d) { 
                return 'line ' + d.key.replace(/\W+/g, '-').toLowerCase()
            })
            .attr('d', function(d) {
                    return line(d.value);
                });

        // var voronoiGroup = svg.append("g")
        // .attr("class", "voronoi");

        // voronoiGroup.selectAll("path")
        //     .data(voronoi(d3.entries(lines)))
        //     .enter().append("path")
        //       .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
        //       .on("mouseover", mouseover)
        //       .on("mouseout", mouseout);

        svg.append('g').selectAll('path')
            .data(d3.entries(lines))
            .enter()
            .append('path')
            .attr('id', 'hidden-path')
            .attr('class', function(d) { 
                return d.key.replace(/\W+/g, '-').toLowerCase()
            })
            .attr('d', function(d) {
                    return line(d.value);
                })

// / left side labels
        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
            .append('text')
            // console.log(d.key)
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'dead';
                } else {
                    return 'nonblank-label';
                }
            })
            .attr('class', function(d) { 
                return   d.key.replace(/\W+/g, '-').toLowerCase();
            })
            .attr("x",function(d) {
                return x(d['value'][0]['msa'])-3;
                })
            .attr("y",function(d) {
                return y(d['value'][0]['amt']);
                })
            .attr("dy", ".3em")
            // .attr("dx", "-1em")
            .attr("text-anchor", "end")
            .text(function(d) {
                if (is_mobile) {
                    // return  d.key.replace(/(\w.*),/,"$1") + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                    return  d.key + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                    // return  d.key.replace(/(\w+).*/,"$1") + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                    } else {
                    return  d.key + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                    }
                })                    
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            })
            .on('mouseover', mouseover)
            .on('mouseout',mouseoutSVG);


// left white boxes
        svg.append('g').selectAll('rect')
            .data(d3.entries(lines))
            .enter()
            .append('rect')
            // console.log(d.key)
            .attr('id', "whitebox")
            .attr('class', function(d) { 
                return   "box" + d.key.replace(/\W+/g, '-').toLowerCase();
            })
            // .attr("x","-19%")
            .attr("x",function(d) {
                return x(d['value'][0]['msa'])-195;
                })
            .attr("y",function(d) {
                return y(d['value'][0]['amt'])-9;
                })
            .attr("width", "12em")
            .attr("height", "1em")
            .attr("dy", ".3em");
            // .attr("dx", "10px");


// left side labels
        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
            .append('text')
            // console.log(d.key)
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'blank-label';
                } else {
                    return 'dead';
                }
            })
            .attr('class', function(d) { 
                return   d.key.replace(/\W+/g, '-').toLowerCase();
            })
            .attr("x",function(d) {
                return x(d['value'][0]['msa'])-3;
                })
            .attr("y",function(d) {
                return y(d['value'][0]['amt']);
                })
            .attr("dy", ".3em")
            // .attr("dx", "-1em")
            .attr("text-anchor", "end")
            .text(function(d) {
                if (is_mobile) {
                    // return  d.key.replace(/(\w.*),/,"$1") + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                    return  d.key + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                    // return  d.key.replace(/(\w+).*/,"$1") + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                    } else {
                    return  d.key + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                    }
                })                    
function on_mouseover(d, i) {
    if (this.getAttribute('id') == 'nonblank-label') {
        d3.selectAll('#nonblank-label')
            .style('font-size', function(d) {
                if (is_mobile) {
                    return '10px';
                } else {
                    return '11px';
                }
            })
            .style('opacity','.5')
            .attr('dx', '0em')
            .style('stroke-width', '0')
            .style('stroke', '#4F4F4F')
            .style('fill', '#4F4F4F');


            // RegExp
// ^(\w.*),+\s+(\w.*)
// for MSA
// right white boxes

        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
            .append('text')
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'dead';
                } else {
                    return 'nonblank-label';
                }
            })
            .attr('class', function(d) { 
                return d.key.replace(/\W+/g, '-').toLowerCase();
            })
            .attr("x",function(d) {
                return x(d['value'][1]['msa']) + 3 ;
                })
            .attr("y",function(d) {
                return y(d['value'][1]['amt']);
                })
            .attr("dy", ".3em")
            // .attr("dx", ".5em")
            .attr("text-anchor", "start")
            .text(function(d) {return "$" + thousandFormat(d['value'][1]['amt']) + "   " + "  " + d.key;})
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            })            
            .on('mouseover', mouseover)
            .on('mouseout',mouseoutSVG);


        svg.append('g').selectAll('rect')
            .data(d3.entries(lines))
            .enter()
            .append('rect')
            // console.log(d.key)
            .attr('id', "whitebox")
            .attr('class', function(d) { 
                return   "box" + d.key.replace(/\W+/g, '-').toLowerCase();
            })
            // .attr("x","-19%")
            .attr("x",function(d) {
                return x(d['value'][1]['msa']);
                })
            .attr("y",function(d) {
                return y(d['value'][1]['amt'])-9;
                })
            .attr("width", "12em")
            .attr("height", "1em")
            .attr("dy", ".3em");
            // .attr("dx", "10px");   


//right text
        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
            .append('text')
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'blank-label';
                } else {
                    return 'dead';
                }
            })
            .attr('class', function(d) { 
                return d.key.replace(/\W+/g, '-').toLowerCase();
            })
            .attr("x",function(d) {
                return x(d['value'][1]['msa']) + 3 ;
                })
            .attr("y",function(d) {
                return y(d['value'][1]['amt']);
                })
            .attr("dy", ".3em")
            // .attr("dx", ".5em")
            .attr("text-anchor", "start")
            .text(function(d) {return "$" + thousandFormat(d['value'][1]['amt']) + "   " + "  " + d.key;})
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            })            
            .on('mouseover', mouseover)
            .on('mouseout',mouseoutSVG);

        d3.selectAll('#nonblank-path')
            .style('opacity', '.5')
            .style('stroke-width', '1px')
            .style('stroke', '#4F4F4F');

        // var test = this.getAttribute('id');
        // console.log(test)

d3.selectAll("#dead").remove();            
         

        d3.selectAll('.line.' + this.getAttribute('class'))
            .style('stroke-width', '2px')
            .style('stroke', '#3D7FA6');

        d3.selectAll('.' + this.getAttribute('class'))
            .style('font-size', function(d) {
                if (is_mobile) {
                    return '12px';
                } else {
                    return '14px';
                }
            })
            .style('opacity', '1')
            .style('fill', '#3D7FA6')
            .moveToFront();
    }
}

function on_mouseout(d,i) {
    if (this.getAttribute('id') == 'nonblank-label') {
        d3.selectAll('#nonblank-label')
            .style('font-size', function(d) {
                if (is_mobile) {
                    return '10px';
                } else {
                    return '11px';
                }
            })
            .attr('dx', '0em')
            .style('fill', '#4F4F4F')
            .style('opacity', '1');

        d3.selectAll('#nonblank-path')
            .style('opacity', '1')
            .style('stroke-width', '1px')
            .style('stroke', '#4F4F4F');
    }
}


/*
 * Render the graphic
 */
function render(container_width) {
    // console.log(graphic_data)
    var height;
    var margin = {top: 75, right: 350, bottom: 25, left: 350};
    var msaKeep;
    var width;
    
    if (container_width < mobile_threshold){
        height = Math.ceil((container_width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        
        is_mobile = true;
        margin.left = 125;
        margin.right = 125;
        msaKeep = msaKeepmobile;
        num_ticks = 5;
    } else {
        height = Math.ceil((container_width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        
        is_mobile = false;
        margin.left = 200;
        margin.right = 200;
        msaKeep = msaKeepdesk;
        num_ticks = 10;
    }

    width = container_width - margin.left - margin.right;

    // clear out existing graphics
    $graphic.empty();

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    
    var line = d3.svg.line()
        .x(function(d) { return x(d.msa); })
        .y(function(d) { return y(d.amt); });


    var voronoi = d3.geom.voronoi()
        .x(function(d) { return x(d.msa); })
        .y(function(d) { return y(d.amt); });
        // .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);


    var xMap = function(d) { return d.msa;}; 
    var yMap = function(d) { return d.amt;}; 

    // var xVal = function(d) { return d.size;};

    var color = d3.scale.ordinal()
        .range(['#6C2315', '#A23520', '#D8472B', '#E27560', '#ECA395', '#F5D1CA',
            '#714616', '#AA6A21', '#E38D2C', '#EAAA61', '#F1C696', '#F8E2CA',
            '#77631B',  '#B39429',  '#EFC637',  '#F3D469',  '#F7E39B',  '#FBF1CD',
            '#0B403F',  '#11605E',  '#17807E',  '#51A09E',  '#8BC0BF',  '#C5DFDF',
            '#28556F',  '#3D7FA6',  '#51AADE',  '#7DBFE6',  '#A8D5EF',  '#D3EAF7']); // colors

    var test = $("input").val()    
    console.log(test)

    var lines = {};
    for (var column in graphic_data[0]) {
        if (column == 'msa') continue;
        lines[column] = graphic_data.map(function(d) {
            return { 
                'msa': d.msa, 
                'amt': d[column]
            };
        });
    }
   
    var svg = d3.select('#graphic').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    x.domain(d3.extent(graphic_data, function(d) { return d.msa; }));

    y.domain([17500,45000])

    svg.append('g').selectAll('path')
        .data(d3.entries(lines))
        .enter()
        .append('path')
        .attr('id', function(d) {
            var found = $.inArray(d.key, msaKeep)
            if (found == -1 ) {
                return 'blank-path';
            } else {
                return 'nonblank-path';
            }
        })            
        .attr('class', function(d) { 
            return 'line ' + d.key.replace(/\W+/g, '-').toLowerCase()
        })
        .attr('d', function(d) {
                return line(d.value);
            });

    // var voronoiGroup = svg.append("g")
    // .attr("class", "voronoi");

    // voronoiGroup.selectAll("path")
    //     .data(voronoi(d3.entries(lines)))
    //     .enter().append("path")
    //       .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
    //       .on("mouseover", on_mouseover)
    //       .on("mouseout", on_mouseout);

    svg.append('g').selectAll('path')
        .data(d3.entries(lines))
        .enter()
        .append('path')
        .attr('id', 'hidden-path')
        .attr('class', function(d) { 
            return d.key.replace(/\W+/g, '-').toLowerCase()
        })
        .attr('d', function(d) {
                return line(d.value);
            })


    // left white boxes
    svg.append('g').selectAll('rect')
        .data(d3.entries(lines))
        .enter()
        .append('rect')
        // console.log(d.key)
        .attr('id', "whitebox")
        .attr('class', function(d) { 
            return   "box" + d.key.replace(/\W+/g, '-').toLowerCase();
        })
        // .attr("x","-19%")
        .attr("x",function(d) {
            return x(d['value'][0]['msa'])-195;
            })
        .attr("y",function(d) {
            return y(d['value'][0]['amt'])-9;
            })
        .attr("width", "12em")
        .attr("height", "1em")
        .attr("dy", ".3em");
        // .attr("dx", "10px");


    // left side labels
    svg.append('g').selectAll('text')
        .data(d3.entries(lines))
        .enter()
        .append('text')
        // console.log(d.key)
        .attr('id', function(d) {
            var found = $.inArray(d.key, msaKeep)
            if (found == -1 ) {
                return 'blank-label';
            } else {
                return 'nonblank-label';
            }
        })
        .attr('class', function(d) { 
            return   d.key.replace(/\W+/g, '-').toLowerCase();
        })
        .attr("x",function(d) {
            return x(d['value'][0]['msa'])-3;
            })
        .attr("y",function(d) {
            return y(d['value'][0]['amt']);
            })
        .attr("dy", ".3em")
        // .attr("dx", "-1em")
        .attr("text-anchor", "end")
        .text(function(d) {
            if (is_mobile) {
                // return  d.key.replace(/(\w.*),/,"$1") + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                return  d.key + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                // return  d.key.replace(/(\w+).*/,"$1") + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                } else {
                return  d.key + "\u00A0" + "      " + "$" + thousandFormat(d['value'][0]['amt']);
                }
            })                    
        .style('font-size', function(d) {
            if (is_mobile) {
                return "10px";
            } else {
                return "12px";
            }
        })
        .on('mouseover', on_mouseover)
        .on('mouseout', on_mouseout);

    // right white boxes
    svg.append('g').selectAll('rect')
        .data(d3.entries(lines))
        .enter()
        .append('rect')
        // console.log(d.key)
        .attr('id', "whitebox")
        .attr('class', function(d) { 
            return   "box" + d.key.replace(/\W+/g, '-').toLowerCase();
        })
        // .attr("x","-19%")
        .attr("x",function(d) {
            return x(d['value'][1]['msa']);
            })
        .attr("y",function(d) {
            return y(d['value'][1]['amt'])-9;
            })
        .attr("width", "12em")
        .attr("height", "1em")
        .attr("dy", ".3em");
        // .attr("dx", "10px");   


    //right text
    svg.append('g').selectAll('text')
        .data(d3.entries(lines))
        .enter()
        .append('text')
        .attr('id', function(d) {
            var found = $.inArray(d.key, msaKeep)
            if (found == -1 ) {
                return 'blank-label';
            } else {
                return 'nonblank-label';
            }
        })
        .attr('class', function(d) { 
            return d.key.replace(/\W+/g, '-').toLowerCase();
        })
        .attr("x",function(d) {
            return x(d['value'][1]['msa']) + 3 ;
            })
        .attr("y",function(d) {
            return y(d['value'][1]['amt']);
            })
        .attr("dy", ".3em")
        // .attr("dx", ".5em")
        .attr("text-anchor", "start")
        .text(function(d) {return "$" + thousandFormat(d['value'][1]['amt']) + "   " + "  " + d.key;})
        .style('font-size', function(d) {
            if (is_mobile) {
                return "10px";
            } else {
                return "12px";
            }
        })            
        .on('mouseover', on_mouseover)
        .on('mouseout', on_mouseout);

        svg.append('text')
        .attr('id', 'x-label')
        .attr("x", x(1))
        .attr("y", y(45450))
        .attr("dy", ".3em")
        .attr("dx", function(d) {
        if (is_mobile) {
                return "-1em";
            } else {
                return "-.75em";
            }
        })            
        .attr("text-anchor", "end")
        .style('font-size', function(d) {
            if (is_mobile) {
                return "12px";
            } else {
                return "14px";
            }
        })            
        .text("Median Income")


        // // .st
        svg.append('text')
        .attr('id', 'x-label')
        .attr("x", x(2))
        .attr("y", y(45450))
        .attr("dy", ".3em")
        .attr("dx", "1em")
        .attr("text-anchor", "start")
        .style('font-size', function(d) {
            if (is_mobile) {
                return "12px";
            } else {
                return "14px";
            }
        })             
        .text("What It Feels Like");


    // finesse label placement
    console.log(d3.keys(lines))
    d3.selectAll('.boston-ma')
        .attr('dy', '.5em');    
    d3.selectAll('.danville-il')
        .attr('dy', '-.3em');    
    d3.selectAll('.lebanon-pa')
        .attr('dy', '1em');    
    d3.selectAll('.rochester-mn')
        .attr('dy', '-.3em');    
    d3.selectAll('.dallas-fort-worth-tx')
        .attr('dy', '-.15em');    
    d3.selectAll('.houston-tx')
        .attr('dy', '-.15em');      
    d3.selectAll('#nonblank-label')
        .moveToFront();    


    // tyeahead
    if (!typeahead_init ) {
    // typeahead
    if (!typeahead_init ) { // only run this once
>>>>>>> 24949b0d9de7d7941e446764890ce8649ba834c2
        var msas = d3.keys(lines);
        var msas_temp = msaKeepdesk;
        var msaval = [];
        for (x in msas) {
             found = $.inArray(msas[x], msaKeepdesk)
             if (found == -1 ) {
                // console.log(msas[x])
                // console.log(found)
                msaval.push(msas[x])
              } 
        }

        // console.log(msaval)

        
        $('#msa-field .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
          name: 'msaval',
          displayKey: 'value',
          source: substringMatcher(msaval)
            name: 'msas',
            displayKey: 'value',
            source: substringMatcher(msas)
        });
        // $('.typeahead.input-sm').siblings('input.tt-hint').addClass('hint-small');

        $('input.typeahead').on('typeahead:selected', on_typeahead_selected);
        typeahead_init = true;
    }

    if (pymChild) {
        pymChild.sendHeightToParent();
    }
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    $graphic = $('#graphic');
    if (Modernizr.svg) {
        d3.csv(graphic_data_url, function(error, data) {
            graphic_data = data;

            graphic_data.forEach(function(d) {
                d.msa = d.msa
            });

            pymChild = new pym.Child({
                renderCallback: render
            });
        });
    } else {
        // responsive iframe
        pymChild = new pym.Child();
    }
})
