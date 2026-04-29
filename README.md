# Interactive World Map

An interactive, customizable world map library built with Plotly.js that provides choropleth visualization with bubble markers, configurable color schemes, and real-time controls.

## Features

- **Choropleth Visualization**: Color-coded countries based on data values
- **Bubble Markers**: Add markers with custom sizes and hover text for specific locations
- **Customizable Colors**: Configure min/max colors, land default color, and water color
- **Interactive Legend**: Vertical color legend bar with configurable position and size
- **Responsive Design**: Full viewport fit with no scrolling
- **Real-time Controls**: Live configuration panel to adjust map settings
- **No Zoom**: Clean, fixed view without zoom interactions

## Installation

### Using NPM

```bash
npm install interactive-world-map
```

### Using CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/interactive-world-map/interactive-map.css">
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/interactive-world-map/interactive-map.js"></script>
```

### Local Installation

1. Download the package
2. Include the required files in your HTML:

```html
<link rel="stylesheet" href="interactive-map.css">
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<script src="interactive-map.js"></script>
```

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="interactive-map.css">
</head>
<body>
  <div id="map-container"></div>
  
  <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
  <script src="interactive-map.js"></script>
  <script>
    const config = {
      containerId: 'map-container',
      minColor: '#8db5d5',
      maxColor: '#0d5592',
      landDefaultColor: '#e0e8f0',
      waterColor: '#a8c5dd'
    };
    
    const data = {
      'USA': 100,
      'GBR': 80,
      'FRA': 75,
      'DEU': 90,
      'JPN': 85
    };
    
    const map = new InteractiveMap(config);
    map.render(data);
  </script>
</body>
</html>
```

### With Bubble Markers

```javascript
const markers = [
  { location: 'New York', lat: 40.7128, lon: -74.0060, size: 20, text: 'New York<br>Population: 8.3M' },
  { location: 'London', lat: 51.5074, lon: -0.1278, size: 15, text: 'London<br>Population: 9M' },
  { location: 'Tokyo', lat: 35.6762, lon: 139.6503, size: 25, text: 'Tokyo<br>Population: 14M' }
];

const config = {
  containerId: 'map-container',
  minColor: '#8db5d5',
  maxColor: '#0d5592',
  markers: markers
};

const map = new InteractiveMap(config);
map.render(data);
```

## Configuration Options

### Basic Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | `'map-container'` | ID of the container element |
| `minColor` | string | `'#8db5d5'` | Color for minimum data values |
| `maxColor` | string | `'#0d5592'` | Color for maximum data values |
| `landDefaultColor` | string | `'#e0e8f0'` | Color for countries without data |
| `waterColor` | string | `'#a8c5dd'` | Color for oceans and seas |

### Legend Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `colorBarX` | number | `0.98` | Horizontal position (0-1, right-aligned) |
| `colorBarY` | number | `0.15` | Vertical position from bottom (0-1) |
| `colorBarLen` | number | `0.3` | Length of the color bar (0-1) |
| `colorBarThickness` | number | `12` | Thickness in pixels |

### Marker Configuration

Each marker in the `markers` array should have:

```javascript
{
  location: string,    // Name of the location
  lat: number,        // Latitude
  lon: number,        // Longitude
  size: number,       // Size of the bubble (1-50)
  text: string        // Hover text (supports HTML)
}
```

## API Reference

### InteractiveMap Class

#### Constructor

```javascript
new InteractiveMap(config)
```

Creates a new map instance with the specified configuration.

**Parameters:**
- `config` (Object): Configuration object with the options listed above

#### Methods

##### render(data, markers)

```javascript
map.render(data, markers)
```

Renders the map with the specified data and markers.

**Parameters:**
- `data` (Object): Country data as key-value pairs where keys are ISO 3-letter country codes
- `markers` (Array, optional): Array of marker objects to display on the map

**Example:**
```javascript
const data = {
  'USA': 100,
  'GBR': 80,
  'CHN': 95
};

const markers = [
  { location: 'New York', lat: 40.7128, lon: -74.0060, size: 20, text: 'NYC' }
];

map.render(data, markers);
```

## Country Codes

The map uses ISO 3166-1 alpha-3 country codes. Common examples:

- `USA` - United States
- `GBR` - United Kingdom
- `FRA` - France
- `DEU` - Germany
- `CHN` - China
- `JPN` - Japan
- `IND` - India
- `BRA` - Brazil
- `CAN` - Canada
- `AUS` - Australia

For a complete list, see [ISO 3166-1 alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3).

## Demo

The package includes a demo file (`demo.html`) that provides a full interactive configuration panel. Open it in a browser to:

- Adjust colors in real-time
- Configure legend position and size
- Add and test bubble markers
- Toggle various map settings

```bash
npm run demo
```

## Code Examples

The package includes an `examples.html` file with comprehensive code examples showing:

- Basic map setup
- Adding bubble markers
- Customizing colors
- Dynamic data updates
- Multiple configuration scenarios

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- [Plotly.js](https://plotly.com/javascript/) (^2.27.0)

## License

MIT

## Repository

[https://github.com/ehteshamnasim/interactive-world-map](https://github.com/ehteshamnasim/interactive-world-map)

## Issues

Report issues at: [https://github.com/ehteshamnasim/interactive-world-map/issues](https://github.com/ehteshamnasim/interactive-world-map/issues)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
