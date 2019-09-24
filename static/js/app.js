function buildMetadata(sample) {

  // build the metadata panel using d3.json to fetch data / Use d3 to select the panel with id of `#sample-metadata

  var metadata = d3.select("#sample-metadata");
  var url = "/metadata/" + sample;

    // clear any existing metadata, add each key and value pair to the panel use d3 to append new tags for each key-value in the metadata.

    d3.json(url).then(function(results) {
      console.log(results);
      // ("#sample-metadata").empty();
      Object.entries(results).forEach(([key, value]) => metadata.append("p").text(`${key}: ${value}`));
    });
  }

function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots, slice() to grab the top 10 sample_values, otu_ids, and labels (10 each).
    
    var url = "/samples/" + sample;
    d3.json(url).then(function(results) {
      console.log(results);

      // empty arrays
      var dataValues = [];
      var outtieIDS = [];
      var outtieLables = [];
      var total = results.sample_values.length;

//sorting 
      var GetOrder = new Array(total);
      for (var i = 0; i < total; i++) {
        GetOrder[i] = i;
        GetOrder.sort(function (a, b) { return results.sample_values[a] < results.sample_values[b] });
      }    

      for (var i =0; i<10; i++){
        var j = GetOrder[i];
        dataValues.push(results.sample_values[j]);
        outtieIDS.push(results.otu_ids[j]);
        outtieLables.push(results.otu_labels[j]);
      }
      
    // layout for plots
      var layout1 = {
        annotations: [
          {
            font: {
              size: 15
            },
            showarrow: false,
            text: "Top 10 Samples",
            x: 0.3,
            y: 0.5
          }
        ],
        height: 500,
        width: 500
      };

// Build a Pie Chart
      var trace1 = [{
        type: "pie",
        values: dataValues,
        labels: outtieIDS.map(String),
        text: outtieLables,
        hole: .4,
        textinfo: 'percent'
      }];
      console.log(trace1);
      var PIE = document.getElementById('pie');
      Plotly.newPlot(PIE, trace1, layout1);

  // Build a Bubble Chart using the sample data
      var trace2 = [{
        x: results.otu_ids,
        y: results.sample_values,
        text: results.otu_labels,
        mode: 'markers',
        marker: {
          color:results.otu_ids,
          size: results.sample_values
        }
      }];
      var layout2 = {
        title: 'Bubble chart for each sample',
        showlegend: false,
        height: 600,
        width: 1400
      };
      console.log(trace2);
      Plotly.newPlot('bubble', trace2, layout2);
    });
  }
  

function init() {
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
