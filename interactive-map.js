/**
 * Interactive World Map Library - Enhanced Version
 * Version: 2.3.0 - Teal Countries and Bubbles
 */

(function(global) {
  'use strict';

  class InteractiveMap {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.container = document.getElementById(containerId);
      
      if (!this.container) {
        throw new Error(`Container with id "${containerId}" not found`);
      }

      this.config = {
        chartTitle: '',
        description: '',
        theme: 'light',
        projection: 'miller',
        width: null,
        height: null,
        
        hideHeader: false,
        hideDescription: false,
        hideCaptions: false,
        hideControls: false,
        hideTableControl: false,
        hideFullscreenControl: false,
        hideDownloadControl: false,
        hideLegend: false,
        noBorder: false,
        
        colorPalette: 'sequential01',
        customColorScale: null,
        
        customLabels: {},
        tooltipTemplate: null,
        
        htmlLegendMaxHeight: 300,
        htmlLegendOptions: {
          position: 'bottom',
          orientation: 'horizontal'
        },
        
        colors: {
          light: {
            scale: [
              [0, '#8db5d5'],
              [0.35, '#5a9fce'],
              [0.65, '#2b7ab8'],
              [1, '#0d5592']
            ],
            landDefault: '#e0e8f0',
            borders: 'white',
            ocean: '#fff',
            scatterDefault: '#5db8a8',
            scatterHighlight: '#d4b85f'
          },
          dark: {
            scale: [
              [0, '#1a3d52'],
              [0.35, '#2e6178'],
              [0.65, '#4a8aa8'],
              [1, '#6bb3d6']
            ],
            landDefault: '#1e2530',
            borders: '#3d4451',
            ocean: '#0d1117',
            scatterDefault: '#5db8a8',
            scatterHighlight: '#d4b85f'
          }
        },
        
        colorbar: {
          orientation: 'h',
          x: 0.5,
          y: 0.02,
          len: 0.4,
          thickness: 15
        },
        
        enableClick: true,
        enableZoom: true,
        enablePan: true,
        enableHover: true,
        responsive: true,
        enableAnimation: false,
        animationDuration: 500,
        
        enableSearch: false,
        enableFilter: false,
        
        dataLabelsVisible: false,
        showCountryNames: false,
      };

      this.config = this._deepMerge(this.config, options);

      this.countryData = [];
      this.scatterData = [];
      this.filteredCountryData = [];
      this.filteredScatterData = [];
      
      this.callbacks = {
        onCountryClick: null,
        onMarkerClick: null,
        onCountryHover: null,
        onMarkerHover: null,
        onThemeChange: null,
        onDownload: null,
        onFullscreen: null,
        onTableToggle: null
      };

      this._isFullscreen = false;
      this._tableVisible = false;
      
      this._init();
    }

    _init() {
      this.container.classList.add('interactive-map-container');
      this.container.classList.add(`theme-${this.config.theme}`);
      
      this._createMapContainer();
      
      if (!this.config.hideHeader) {
        this._createHeader();
      }
      
      if (!this.config.hideControls) {
        this._createControls();
      }
      
      if (this.config.enableSearch) {
        this._createSearchBox();
      }
      
      if (!this.config.noBorder) {
        this.container.style.border = this.config.theme === 'dark' ? '1px solid #3d4451' : '1px solid #e1e4e8';
        this.container.style.borderRadius = '8px';
      }
      
      if (this.config.width) {
        this.container.style.width = typeof this.config.width === 'number' ? `${this.config.width}px` : this.config.width;
      }
      if (this.config.height) {
        this.container.style.height = typeof this.config.height === 'number' ? `${this.config.height}px` : this.config.height;
      }
    }

    _createMapContainer() {
      this.mapDiv = document.createElement('div');
      this.mapDiv.id = `${this.containerId}_map`;
      this.mapDiv.style.width = '100%';
      this.mapDiv.style.height = '100%';
      this.mapDiv.style.position = 'relative';
      this.container.appendChild(this.mapDiv);
    }

    _createHeader() {
      const header = document.createElement('div');
      header.className = 'map-header';
      header.style.cssText = `
        padding: 15px 20px;
        border-bottom: ${this.config.theme === 'dark' ? '1px solid #3d4451' : '1px solid #e1e4e8'};
        background: ${this.config.theme === 'dark' ? '#1e2530' : '#ffffff'};
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      
      const titleContainer = document.createElement('div');
      
      if (this.config.chartTitle) {
        const title = document.createElement('h2');
        title.textContent = this.config.chartTitle;
        title.style.cssText = `
          margin: 0 0 ${this.config.description && !this.config.hideDescription ? '8px' : '0'};
          font-size: 20px;
          font-weight: 600;
          color: ${this.config.theme === 'dark' ? '#ffffff' : '#24292f'};
        `;
        titleContainer.appendChild(title);
      }
      
      if (this.config.description && !this.config.hideDescription) {
        const desc = document.createElement('p');
        desc.textContent = this.config.description;
        desc.style.cssText = `
          margin: 0;
          font-size: 14px;
          color: ${this.config.theme === 'dark' ? '#8b949e' : '#57606a'};
        `;
        titleContainer.appendChild(desc);
      }
      
      header.appendChild(titleContainer);
      
      if (!this.config.hideControls) {
        const controls = this._createControlButtons();
        header.appendChild(controls);
      }
      
      this.container.insertBefore(header, this.mapDiv);
    }

    _createControlButtons() {
      const controls = document.createElement('div');
      controls.className = 'map-controls';
      controls.style.cssText = `
        display: flex;
        flex-direction: row;
        gap: 8px;
        align-items: center;
      `;
      
      const buttonStyle = `
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        background: ${this.config.theme === 'dark' ? '#21262d' : '#f6f8fa'};
        color: ${this.config.theme === 'dark' ? '#ffffff' : '#24292f'};
        border: 1px solid ${this.config.theme === 'dark' ? '#3d4451' : '#d0d7de'};
        transition: all 0.2s;
        white-space: nowrap;
      `;
      
      if (!this.config.hideDownloadControl) {
        const downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = 'Download';
        downloadBtn.title = 'Download';
        downloadBtn.style.cssText = buttonStyle;
        downloadBtn.onclick = () => this._showDownloadMenu(downloadBtn);
        controls.appendChild(downloadBtn);
      }
      
      if (!this.config.hideTableControl) {
        const tableBtn = document.createElement('button');
        tableBtn.innerHTML = 'Table';
        tableBtn.title = 'Table View';
        tableBtn.style.cssText = buttonStyle;
        tableBtn.onclick = () => this.toggleTable();
        controls.appendChild(tableBtn);
        this.tableBtn = tableBtn;
      }
      
      if (!this.config.hideFullscreenControl) {
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.innerHTML = 'Fullscreen';
        fullscreenBtn.title = 'Fullscreen';
        fullscreenBtn.style.cssText = buttonStyle;
        fullscreenBtn.onclick = () => this.toggleFullscreen();
        controls.appendChild(fullscreenBtn);
        this.fullscreenBtn = fullscreenBtn;
      }
      
      return controls;
    }

    _createControls() {
    
    }

    _createSearchBox() {
      const searchContainer = document.createElement('div');
      searchContainer.style.cssText = `
        position: absolute;
        top: 15px;
        left: 15px;
        z-index: 1000;
      `;
      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search country...';
      searchInput.style.cssText = `
        padding: 8px 12px;
        border: 1px solid ${this.config.theme === 'dark' ? '#3d4451' : '#e1e4e8'};
        border-radius: 6px;
        background: ${this.config.theme === 'dark' ? '#21262d' : '#ffffff'};
        color: ${this.config.theme === 'dark' ? '#ffffff' : '#24292f'};
        font-size: 14px;
        width: 200px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      `;
      
      searchInput.addEventListener('input', (e) => this._handleSearch(e.target.value));
      searchContainer.appendChild(searchInput);
      this.mapDiv.appendChild(searchContainer);
      this.searchInput = searchInput;
    }

    _showDownloadMenu(button) {
      const menu = document.createElement('div');
      menu.style.cssText = `
        position: absolute;
        top: 40px;
        right: 0;
        background: ${this.config.theme === 'dark' ? '#21262d' : '#ffffff'};
        border: 1px solid ${this.config.theme === 'dark' ? '#3d4451' : '#e1e4e8'};
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1001;
        min-width: 150px;
      `;
      
      const options = [
        { label: 'PNG', format: 'png' },
        { label: 'SVG', format: 'svg' },
        { label: 'CSV', format: 'csv' },
        { label: 'JSON', format: 'json' }
      ];
      
      options.forEach(opt => {
        const item = document.createElement('div');
        item.textContent = opt.label;
        item.style.cssText = `
          padding: 10px 15px;
          cursor: pointer;
          color: ${this.config.theme === 'dark' ? '#ffffff' : '#24292f'};
          border-bottom: 1px solid ${this.config.theme === 'dark' ? '#3d4451' : '#e1e4e8'};
        `;
        item.onmouseover = () => {
          item.style.background = this.config.theme === 'dark' ? '#2d333b' : '#f6f8fa';
        };
        item.onmouseout = () => {
          item.style.background = 'transparent';
        };
        item.onclick = () => {
          this.download(opt.format);
          menu.remove();
        };
        menu.appendChild(item);
      });
      
      button.parentElement.style.position = 'relative';
      button.parentElement.appendChild(menu);
      
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!menu.contains(e.target) && e.target !== button) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        });
      }, 0);
    }

    _handleSearch(query) {
      if (!query) {
        this.filteredCountryData = [...this.countryData];
        this.filteredScatterData = [...this.scatterData];
      } else {
        const lowerQuery = query.toLowerCase();
        this.filteredCountryData = this.countryData.filter(c => 
          (c.name || c.country).toLowerCase().includes(lowerQuery)
        );
      }
      this.render();
    }

    async loadCountryData(data) {
      if (typeof data === 'string') {
        const response = await fetch(data);
        if (!response.ok) {
          throw new Error(`Failed to load country data: ${response.statusText}`);
        }
        this.countryData = await response.json();
      } else if (Array.isArray(data)) {
        if (data.length > 0) {
          const firstItem = data[0];
          if (!firstItem.country || firstItem.value === undefined) {
            throw new Error('Country data must have "country" and "value" properties');
          }
        }
        this.countryData = data;
      } else {
        throw new Error('Invalid country data format');
      }
      this.filteredCountryData = [...this.countryData];
      return this.countryData;
    }

    async loadScatterData(data) {
      if (typeof data === 'string') {
        const response = await fetch(data);
        if (!response.ok) {
          throw new Error(`Failed to load scatter data: ${response.statusText}`);
        }
        this.scatterData = await response.json();
      } else if (Array.isArray(data)) {
        if (data.length > 0) {
          const firstItem = data[0];
          if (firstItem.lon === undefined || firstItem.lat === undefined) {
            throw new Error('Scatter data must have "lon" and "lat" properties');
          }
        }
        this.scatterData = data;
      } else {
        throw new Error('Invalid scatter data format');
      }
      this.filteredScatterData = [...this.scatterData];
      return this.scatterData;
    }

    async render() {
      if (!window.Plotly) {
        throw new Error('Plotly library not loaded');
      }

      const currentTheme = this.config.colors[this.config.theme];
      const colorScale = this.config.customColorScale || currentTheme.scale;
      
      const dataToRender = this.filteredCountryData.length ? this.filteredCountryData : this.countryData;

      const trace1 = {
        type: 'choropleth',
        locationmode: 'ISO-3',
        locations: dataToRender.map(d => d.country),
        z: dataToRender.map(d => d.value),
        text: dataToRender.map(d => {
          const label = this.config.customLabels[d.country] || d.name || d.country;
          return label;
        }),
        colorscale: colorScale,
        showscale: !this.config.hideLegend,
        colorbar: !this.config.hideLegend ? {
          orientation: this.config.colorbar?.orientation || 'v',
          x: this.config.colorbar?.x !== undefined ? this.config.colorbar.x : 0.98,
          xanchor: 'right',
          y: this.config.colorbar?.y !== undefined ? this.config.colorbar.y : 0.15,
          yanchor: 'bottom',
          len: this.config.colorbar?.len !== undefined ? this.config.colorbar.len : 0.3,
          thickness: this.config.colorbar?.thickness !== undefined ? this.config.colorbar.thickness : 12,
          tickfont: {
            size: 9,
            color: this.config.theme === 'dark' ? '#fff' : '#333'
          },
          outlinecolor: this.config.theme === 'dark' ? '#444' : '#ddd',
          outlinewidth: 1,
          bgcolor: 'rgba(255,255,255,0.8)',
          bordercolor: this.config.theme === 'dark' ? '#555' : '#ccc',
          borderwidth: 1,
          title: {
            text: '',
            side: 'bottom'
          }
        } : undefined,
        marker: {
          line: {
            color: currentTheme.borders,
            width: 1
          }
        },
        hovertemplate: this.config.tooltipTemplate || '<b>%{text}</b><br>Value: %{z}%<extra></extra>',
        hoverlabel: {
          bgcolor: this.config.theme === 'dark' ? '#1e2530' : 'white',
          font: { color: this.config.theme === 'dark' ? 'white' : 'black' }
        }
      };

      const scatterDataToRender = this.filteredScatterData.length ? this.filteredScatterData : this.scatterData;

      const trace2 = {
        type: 'scattergeo',
        mode: 'markers' + (this.config.dataLabelsVisible ? '+text' : ''),
        lon: scatterDataToRender.map(d => d.lon),
        lat: scatterDataToRender.map(d => d.lat),
        text: scatterDataToRender.map(d => d.label || ''),
        textposition: 'top center',
        marker: {
          size: scatterDataToRender.map(d => (d.size || 50) * 0.35),
          color: scatterDataToRender.map(d => d.color || currentTheme.scatterDefault),
          opacity: 0.75,
          line: {
            color: this.config.theme === 'dark' ? '#2d7a5f' : '#2d7a5f',
            width: 1.5
          }
        },
        hovertemplate: '<b>%{text}</b><br>Lat: %{lat}<br>Lon: %{lon}<extra></extra>',
        hoverlabel: {
          bgcolor: this.config.theme === 'dark' ? '#1e2530' : 'white',
          font: { color: this.config.theme === 'dark' ? 'white' : 'black' }
        }
      };

      const layout = {
        geo: {
          domain: {
            x: [0, 1],
            y: [0, 1]
          },
          projection: {
            type: this.config.projection
          },
          showland: true,
          landcolor: currentTheme.landDefault,
          showcountries: true,
          countrycolor: currentTheme.borders,
          countrywidth: 1,
          showocean: true,
          oceancolor: currentTheme.ocean,
          showlakes: false,
          showrivers: false,
          showframe: false,
          coastlinewidth: 0,
          bgcolor: currentTheme.ocean
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
        paper_bgcolor: currentTheme.ocean,
        plot_bgcolor: currentTheme.ocean,
        showlegend: false,
        dragmode: false,
        hovermode: this.config.enableHover ? 'closest' : false,
        autosize: this.config.responsive,
        transition: this.config.enableAnimation ? {
          duration: this.config.animationDuration,
          easing: 'cubic-in-out'
        } : undefined
      };

      const config = {
        responsive: this.config.responsive,
        displayModeBar: false,
        scrollZoom: false,
        doubleClick: false,
        modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d'],
        scrollZoomSpeed: 0.5
      };

      await Plotly.newPlot(this.mapDiv.id, [trace1, trace2], layout, config);

      if (this.config.enableClick) {
        this.mapDiv.on('plotly_click', (data) => this._handleClick(data));
      }

      if (this.config.enableHover) {
        this.mapDiv.on('plotly_hover', (data) => this._handleHover(data));
      }

      if (this.config.responsive) {
        window.addEventListener('resize', () => this.resize());
      }

      return this;
    }

    _handleClick(data) {
      if (!data.points || !data.points[0]) return;
      
      const point = data.points[0];
      
      if (point.curveNumber === 0) {
        const countryInfo = this.countryData.find(c => c.country === point.location);
        if (countryInfo && this.callbacks.onCountryClick) {
          this.callbacks.onCountryClick(countryInfo, point);
        }
      } else if (point.curveNumber === 1) {
        const markerInfo = this.scatterData[point.pointIndex];
        if (markerInfo && this.callbacks.onMarkerClick) {
          this.callbacks.onMarkerClick(markerInfo, point);
        }
      }
    }

    _handleHover(data) {
      if (!data.points || !data.points[0]) return;
      
      const point = data.points[0];
      
      if (point.curveNumber === 0 && this.callbacks.onCountryHover) {
        const countryInfo = this.countryData.find(c => c.country === point.location);
        if (countryInfo) {
          this.callbacks.onCountryHover(countryInfo, point);
        }
      } else if (point.curveNumber === 1 && this.callbacks.onMarkerHover) {
        const markerInfo = this.scatterData[point.pointIndex];
        if (markerInfo) {
          this.callbacks.onMarkerHover(markerInfo, point);
        }
      }
    }

    on(event, callback) {
      const validEvents = ['countryClick', 'markerClick', 'countryHover', 'markerHover', 'themeChange', 'download', 'fullscreen', 'tableToggle'];
      
      if (!validEvents.includes(event)) {
        console.warn(`Invalid event: ${event}. Valid events: ${validEvents.join(', ')}`);
        return this;
      }

      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
      return this;
    }

    toggleTheme() {
      this.setTheme(this.config.theme === 'light' ? 'dark' : 'light');
      return this;
    }

    setTheme(theme) {
      if (theme !== 'light' && theme !== 'dark') {
        console.warn('Invalid theme. Use "light" or "dark"');
        return this;
      }

      this.config.theme = theme;
      this.container.classList.remove('theme-light', 'theme-dark');
      this.container.classList.add(`theme-${theme}`);
      
      if (this.callbacks.onThemeChange) {
        this.callbacks.onThemeChange(theme);
      }

      this.render();
      return this;
    }

    updateCountryData(data) {
      this.countryData = data;
      this.filteredCountryData = [...data];
      return this.render();
    }

    updateScatterData(data) {
      this.scatterData = data;
      this.filteredScatterData = [...data];
      return this.render();
    }

    updateData(countryData, scatterData) {
      this.countryData = countryData;
      this.scatterData = scatterData;
      this.filteredCountryData = [...countryData];
      this.filteredScatterData = [...scatterData];
      return this.render();
    }

    setProjection(projection) {
      this.config.projection = projection;
      return this.render();
    }

    setColorPalette(palette) {
      const palettes = {
        sequential01: [
          [0, '#dce7ea'],
          [0.4, '#89abb3'],
          [0.7, '#4f8790'],
          [1, '#29707A']
        ],
        sequential02: [
          [0, '#fee5d9'],
          [0.4, '#fcae91'],
          [0.7, '#fb6a4a'],
          [1, '#cb181d']
        ],
        sequential03: [
          [0, '#edf8e9'],
          [0.4, '#bae4b3'],
          [0.7, '#74c476'],
          [1, '#238b45']
        ],
        diverging: [
          [0, '#d7191c'],
          [0.25, '#fdae61'],
          [0.5, '#ffffbf'],
          [0.75, '#abd9e9'],
          [1, '#2c7bb6']
        ],
        viridis: [
          [0, '#440154'],
          [0.25, '#31688e'],
          [0.5, '#35b779'],
          [0.75, '#fde724'],
          [1, '#fee825']
        ]
      };
      
      if (palettes[palette]) {
        this.config.customColorScale = palettes[palette];
        return this.render();
      } else {
        console.warn('Invalid palette. Available: ' + Object.keys(palettes).join(', '));
        return this;
      }
    }

    highlightCountry(countryCode) {
      const country = this.countryData.find(c => c.country === countryCode);
      if (country && this.callbacks.onCountryClick) {
        this.callbacks.onCountryClick(country, { location: countryCode });
      }
      return this;
    }

    filterCountries(filterFn) {
      this.filteredCountryData = this.countryData.filter(filterFn);
      return this.render();
    }

    resetFilter() {
      this.filteredCountryData = [...this.countryData];
      this.filteredScatterData = [...this.scatterData];
      if (this.searchInput) {
        this.searchInput.value = '';
      }
      return this.render();
    }

    async download(format = 'png') {
      if (format === 'png' || format === 'svg') {
        const opts = {
          format: format,
          width: this.config.width || 1200,
          height: this.config.height || 800,
          filename: `world-map-${Date.now()}`
        };
        await Plotly.downloadImage(this.mapDiv.id, opts);
      } else if (format === 'csv') {
        this._downloadCSV();
      } else if (format === 'json') {
        this._downloadJSON();
      }
      
      if (this.callbacks.onDownload) {
        this.callbacks.onDownload(format);
      }
      
      return this;
    }

    _downloadCSV() {
      let csv = 'Country,Value,Name\n';
      this.countryData.forEach(c => {
        csv += `${c.country},${c.value},"${c.name || c.country}"\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `world-map-data-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    _downloadJSON() {
      const data = {
        countries: this.countryData,
        markers: this.scatterData,
        config: this.exportConfig()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `world-map-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toggleFullscreen() {
      if (!this._isFullscreen) {
        if (this.container.requestFullscreen) {
          this.container.requestFullscreen();
        } else if (this.container.webkitRequestFullscreen) {
          this.container.webkitRequestFullscreen();
        } else if (this.container.mozRequestFullScreen) {
          this.container.mozRequestFullScreen();
        } else if (this.container.msRequestFullscreen) {
          this.container.msRequestFullscreen();
        }
        this._isFullscreen = true;
        if (this.fullscreenBtn) {
          this.fullscreenBtn.innerHTML = 'Exit Fullscreen';
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this._isFullscreen = false;
        if (this.fullscreenBtn) {
          this.fullscreenBtn.innerHTML = 'Fullscreen';
        }
      }
      
      if (this.callbacks.onFullscreen) {
        this.callbacks.onFullscreen(this._isFullscreen);
      }
      
      setTimeout(() => this.resize(), 100);
      return this;
    }

    toggleTable() {
      if (!this._tableVisible) {
        this._showTable();
      } else {
        this._hideTable();
      }
      
      if (this.callbacks.onTableToggle) {
        this.callbacks.onTableToggle(this._tableVisible);
      }
      
      return this;
    }

    _showTable() {
      if (this._tableElement) {
        this._tableElement.style.display = 'block';
        this._tableVisible = true;
        return;
      }
      
      const tableContainer = document.createElement('div');
      tableContainer.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40%;
        background: ${this.config.theme === 'dark' ? '#1e2530' : '#ffffff'};
        border-top: 1px solid ${this.config.theme === 'dark' ? '#3d4451' : '#e1e4e8'};
        overflow: auto;
        z-index: 999;
      `;
      
      let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; color: ${this.config.theme === 'dark' ? '#ffffff' : '#24292f'};">
          <thead>
            <tr style="background: ${this.config.theme === 'dark' ? '#21262d' : '#f6f8fa'};">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid ${this.config.theme === 'dark' ? '#3d4451' : '#d0d7de'};">Country</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid ${this.config.theme === 'dark' ? '#3d4451' : '#d0d7de'};">Code</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid ${this.config.theme === 'dark' ? '#3d4451' : '#d0d7de'};">Value</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      this.countryData.forEach((c, i) => {
        tableHTML += `
          <tr style="border-bottom: 1px solid ${this.config.theme === 'dark' ? '#3d4451' : '#d0d7de'};">
            <td style="padding: 10px;">${c.name || c.country}</td>
            <td style="padding: 10px;">${c.country}</td>
            <td style="padding: 10px;">${c.value}%</td>
          </tr>
        `;
      });
      
      tableHTML += '</tbody></table>';
      tableContainer.innerHTML = tableHTML;
      
      this.mapDiv.style.position = 'relative';
      this.mapDiv.appendChild(tableContainer);
      this._tableElement = tableContainer;
      this._tableVisible = true;
    }

    _hideTable() {
      if (this._tableElement) {
        this._tableElement.style.display = 'none';
        this._tableVisible = false;
      }
    }

    resize() {
      if (window.Plotly && window.Plotly.Plots) {
        Plotly.Plots.resize(this.mapDiv.id);
      }
      return this;
    }

    destroy() {
      if (window.Plotly) {
        Plotly.purge(this.mapDiv.id);
      }
      window.removeEventListener('resize', () => this.resize());
      this.container.innerHTML = '';
      this.container.classList.remove('interactive-map-container', 'theme-light', 'theme-dark');
      return this;
    }

    exportConfig() {
      return JSON.parse(JSON.stringify(this.config));
    }

    exportData() {
      return {
        countries: JSON.parse(JSON.stringify(this.countryData)),
        markers: JSON.parse(JSON.stringify(this.scatterData))
      };
    }

    _deepMerge(target, source) {
      const output = Object.assign({}, target);
      if (this._isObject(target) && this._isObject(source)) {
        Object.keys(source).forEach(key => {
          if (this._isObject(source[key])) {
            if (!(key in target)) {
              Object.assign(output, { [key]: source[key] });
            } else {
              output[key] = this._deepMerge(target[key], source[key]);
            }
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    }

    _isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = InteractiveMap;
    }
    exports.InteractiveMap = InteractiveMap;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return InteractiveMap;
    });
  } else {
    global.InteractiveMap = InteractiveMap;
  }

})(typeof window !== 'undefined' ? window : this);
