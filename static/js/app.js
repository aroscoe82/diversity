function buildMetadata(sample) {
  console.log('buildMetadata: ', sample);
  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  // ****** Can not get error to work
  d3.json("/metadata/" + sample)
    .then(function(response){

      var data = response;

      // Use d3 to select the panel with id of `#sample-metadata`
      var metaPanel = document.querySelector('#sample-metadata');
      // Use `.html("") to clear any existing metadata
      metaPanel.innerHTML = '';
      var html = '';

      // Use `Object.entries` to add each key and value pair to the panel
      html += '<ul class="list-unstyled">';
      for(var entry in data){
        // Hint: Inside the loop, you will need to use d3 to append new 
        // tags for each key-value in the metadata.
        html += '<li><strong>' + entry + '</strong>: ' + data[entry] + '</li>';
      }
      html += '</ul>';
      
      metaPanel.innerHTML = html;

      // BONUS: Build the Gauge Chart
      buildGauge(data.WFREQ);

    }, function(error){
      console.log('error: ', error);
    });

}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json("/samples/" + sample)
    .then(function(response){
      var data = response;

      console.log('data: ', data);

      // @TODO: Build a Bubble Chart using the sample data
      var bubbleChart = document.querySelector('#bubble');
      var bubbleLabels = response.otu_labels;

      var bubbleData = response.otu_ids;
      var bubbleSamples = response.sample_values;

      // ***** Labels are not right
      var bubble = [{
        x: bubbleData,
        y: bubbleSamples,
        mode: 'markers',
        marker: {
          size: bubbleSamples,
          color: bubbleData,
          colorscale: 'Rainbow'
        },
        text: bubbleLabels
      }];

      var bubbleLayout = {
        title: "Germ Diversity",
      }

      Plotly.newPlot(bubbleChart, bubble, bubbleLayout, {responsive: true});


      // @TODO: Build a Pie Chart
      // HINT: You will need to use slice() to grab the top 10 sample_values,
      // otu_ids, and labels (10 each).

      var pieChart = document.querySelector('#pie');
      var pieData = response.otu_ids;
      var pieSamples = response.sample_values.splice(0,9);
      var pieLabels = response.otu_labels;
      
      // ***** Labels are not right
      var pie = [{
        values: pieSamples,
        labels: pieData,
        hovertext: pieLabels,
        type: 'pie'
      }];

      var pieLayout = {
        title: "Germ Diversity",
      }

      Plotly.newPlot(pieChart, pie, pieLayout, {responsive: true});
      
    });
    
}

function buildGauge(wfreq){
  /* https://plot.ly/javascript/gauge-charts/ */
  
  var gaugeChart = document.querySelector('#gauge');
  var level = parseFloat(wfreq) * (180/9); // 180/10 is 180 degrees / 9 sections

  // Trig to calc meter point
  var degrees = 180 - level,
  radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{
      type: 'scatter',
      x: [0],
      y:[0],
      marker: {
        size: 10,
        color:'850000'
      },
      showlegend: false,
      name: 'speed',
      text: level,
      hoverinfo: 'text+name'
    },{
      values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {
        colors:[
          "rgba(0, 105, 11, .5)",
          "rgba(10, 120, 22, .5)",
          "rgba(14, 127, 0, .5)",
          "rgba(110, 154, 22, .5)",
          "rgba(170, 202, 42, .5)",
          "rgba(202, 209, 95, .5)",
          "rgba(210, 206, 145, .5)",
          "rgba(232, 226, 202, .5)",
          "rgba(240, 230, 215, .5)",
          "rgba(255, 255, 255, 0)"
        ]
      },
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var gaugeLayout = {
      shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
      title: 'Germ Frequency',
      xaxis: {
        zeroline:false,
        showticklabels:false,
        showgrid: false,
        range: [-1, 1]},
        yaxis: {
          zeroline:false,
          showticklabels:false,
          showgrid: false,
          range: [-1, 1]}
        };

    Plotly.newPlot(gaugeChart, data, gaugeLayout, {responsive: true});
}

function init() {
  console.log('init')
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
