import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, withStateHandlers } from 'recompose';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow
} from 'react-google-maps';
import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer';

// Helpers
import Client from '../utils/feathers';
import { stripProtocol } from '../utils/url';
import Countries from 'country-list';

// Custom Components
import LayerMapSwitches from './LayerMapSwitches';

// Helpers
import { GOOGLE_MAPS_API } from '../utils/constants';

// Images
import MerchantPin from '../assets/img/map/merchant_pin.png';
import AmbassadorPin from '../assets/img/map/ambassador_pin.png';
import TellerPin from '../assets/img/map/teller_pin.png';

import ambs_m1 from '../assets/img/map/cluster/ambassadors/m1.png';
import ambs_m2 from '../assets/img/map/cluster/ambassadors/m2.png';
import ambs_m3 from '../assets/img/map/cluster/ambassadors/m3.png';
import ambs_m4 from '../assets/img/map/cluster/ambassadors/m4.png';
import ambs_m5 from '../assets/img/map/cluster/ambassadors/m5.png';

import mer_m1 from '../assets/img/map/cluster/merchants/m1.png';
import mer_m2 from '../assets/img/map/cluster/merchants/m2.png';
import mer_m3 from '../assets/img/map/cluster/merchants/m3.png';
import mer_m4 from '../assets/img/map/cluster/merchants/m4.png';
import mer_m5 from '../assets/img/map/cluster/merchants/m5.png';

import tel_m1 from '../assets/img/map/cluster/tellers/m1.png';
import tel_m2 from '../assets/img/map/cluster/tellers/m2.png';
import tel_m3 from '../assets/img/map/cluster/tellers/m3.png';
import tel_m4 from '../assets/img/map/cluster/tellers/m4.png';
import tel_m5 from '../assets/img/map/cluster/tellers/m5.png';

// List of countries
const countries = Countries();

/**
 * This object is used for type checking the props of the component.
 */
const propTypes = {
  ambassadors: PropTypes.array,
  merchants: PropTypes.array,
  mapCenter: PropTypes.object,
  mapZoom: PropTypes.number,
  // Fix google maps modal problem
  showControls: PropTypes.bool
};



/**
 * This object sets default values to the optional props.
 */
const defaultProps = {
  mapCenter: { lat: -22.9068, lng: -43.1729 },
  mapZoom: 12,
  googleMapURL:
  `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API}&v=3.exp&libraries=geometry,drawing,places`,
  loadingElement: <div style={{ height: `100%` }} />,
  containerElement: <div style={{ height: `100%` }} />,
  mapElement: <div style={{ height: `400px` }} />,
  // Fix google maps modal problem
  showControls: true,
  ambassadors: [],
  merchants: [],
  tellers: []
};
defaultProps['markers'] = [
  defaultProps.mapCenter
];

/**
 * Map that support Merchant Layer Markers and Ambassadors Layer Markers.
 */
const CustomLayerMap = compose(
  withStateHandlers(() => ({
    isOpenObj: {},
    isOpenAmbassadorObj:{}
  }), {
    onToggleOpen: ({ isOpenObj }) => (index) => {
      const openObj = isOpenObj;
      openObj[index] = !openObj[index];
      return openObj;
    },
    onToggleAmbassadorOpen: ({ isOpenAmbassadorObj }) => (index) => {
      const openObj = isOpenAmbassadorObj;
      openObj[index] = !openObj[index];
      return openObj;
    }
  }),
  withScriptjs,
  withGoogleMap
)(props =>
  <GoogleMap
    defaultZoom={props.mapZoom}
    defaultCenter={props.mapCenter}
  >
    <MarkerClusterer
        averageCenter
        enableRetinaIcons
        gridSize={60}
        zoomOnClick={true}
        styles={[
      	{
      	  url: ambs_m1,
      	  height: 53,
      	  lineHeight: 53,
      	  width: 53,
      	},
      	{
      	  url: ambs_m2,
      	  height: 56,
      	  lineHeight: 56,
      	  width: 56,
      	},
      	{
      	  url: ambs_m3,
      	  height: 66,
      	  lineHeight: 66,
      	  width: 66,
      	},
      	{
      	  url: ambs_m4,
      	  height: 78,
      	  lineHeight: 78,
      	  width: 78,
      	},
      	{
      	  url: ambs_m5,
      	  height: 90,
      	  lineHeight: 90,
      	  width: 90,
      	},
        ]}
      >
      {props.ambassadors.map( (marker, index) => (
        marker.withInfo ? (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={AmbassadorPin}
            onClick={() => props.onToggleOpen(index)}
          >
            {props.isOpenObj[index] && <InfoWindow onCloseClick={() => props.onToggleOpen(index)}>
              <div>
                <div style={{ font: "bold 16px Georgia, serif" }}>{marker.infoTitle}</div>
                <br />
                <div style={{ font: "14px Georgia, serif" }}>{marker.infoDescription}</div>
              </div>
            </InfoWindow>}
          </Marker>
        ) : (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={AmbassadorPin}
          />
        )
      ))}
    </MarkerClusterer>

    <MarkerClusterer
        averageCenter
        enableRetinaIcons
        gridSize={60}
        zoomOnClick={true}
        styles={[
      	{
      	  url: mer_m1,
      	  height: 53,
      	  lineHeight: 53,
      	  width: 53,
      	},
      	{
      	  url: mer_m2,
      	  height: 56,
      	  lineHeight: 56,
      	  width: 56,
      	},
      	{
      	  url: mer_m3,
      	  height: 66,
      	  lineHeight: 66,
      	  width: 66,
      	},
      	{
      	  url: mer_m4,
      	  height: 78,
      	  lineHeight: 78,
      	  width: 78,
      	},
      	{
      	  url: mer_m5,
      	  height: 90,
      	  lineHeight: 90,
      	  width: 90,
      	},
        ]}
      >
        {props.merchants.map( (marker, index) => (
          marker.withInfo ? (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={MerchantPin}
              onClick={() => props.onToggleAmbassadorOpen(index)}
            >
              {props.isOpenAmbassadorObj[index] && <InfoWindow onCloseClick={() => props.onToggleAmbassadorOpen(index)}>
                <div>
                  <div style={{ font: "bold 16px Georgia, serif" }}>{marker.infoTitle}</div>
                  <br />
                  <div style={{ font: "14px Georgia, serif" }}>{marker.infoDescription}</div>
                </div>
              </InfoWindow>}
            </Marker>
          ) : (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={MerchantPin}
            />
          )
        ))}
    </MarkerClusterer>

    <MarkerClusterer
        averageCenter
        enableRetinaIcons
        gridSize={60}
        zoomOnClick={true}
        styles={[
      	{
      	  url: tel_m1,
      	  height: 53,
      	  lineHeight: 53,
      	  width: 53,
      	},
      	{
      	  url: tel_m2,
      	  height: 56,
      	  lineHeight: 56,
      	  width: 56,
      	},
      	{
      	  url: tel_m3,
      	  height: 66,
      	  lineHeight: 66,
      	  width: 66,
      	},
      	{
      	  url: tel_m4,
      	  height: 78,
      	  lineHeight: 78,
      	  width: 78,
      	},
      	{
      	  url: tel_m5,
      	  height: 90,
      	  lineHeight: 90,
      	  width: 90,
      	},
        ]}
      >
        {props.tellers.map( (marker, index) => (
          marker.withInfo ? (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={TellerPin}
              onClick={() => props.onToggleAmbassadorOpen(index)}
            >
              {props.isOpenAmbassadorObj[index] && <InfoWindow onCloseClick={() => props.onToggleAmbassadorOpen(index)}>
                <div>
                  <div style={{ font: "bold 16px Georgia, serif" }}>{marker.infoTitle}</div>
                  <br />
                  <div style={{ font: "14px Georgia, serif" }}>{marker.infoDescription}</div>
                </div>
              </InfoWindow>}
            </Marker>
          ) : (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={TellerPin}
            />
          )
        ))}
    </MarkerClusterer>

  </GoogleMap>
);

// Type checking the props of the component
CustomLayerMap.propTypes = propTypes;
// Assign default values to the optional props
CustomLayerMap.defaultProps = defaultProps;

// Type checking the props of the component
CustomLayerMap.propTypes = propTypes;
// Assign default values to the optional props
CustomLayerMap.defaultProps = defaultProps;

class LayerMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ambassadors: [],
      merchants: [],
      tellers: [],
      ambassadorLayer: this.props.ambassadorsLayer,
      merchantLayer: this.props.merchantsLayer,
      tellerLayer: this.props.tellersLayer,
    };
  }

  /**
   * @description Lifecycle event handler called just after the App loads into the DOM.
   */
  UNSAFE_componentWillMount() {
    this.getAmbassadors();
    this.getMerchants();
    this.getTellers();
  }

  fillResults(result) {
    const data = result;
    return (item) => data.data.push(item);
  }

  /**
   * @description Get ambassadors from the web service
   * @param {number} [limit=10] - Max items to be returned.
   * @param {number} [skip=0] - Start index search
   */
  getAmbassadors = async (limit = 50, skip = 0) => {
    const app = this;
    // Initially we don't know how much the total value is, so to make sure we enter the loop
    // at least once we're just setting it to be 1
    let total = 1;

    const ambassadors = Client.service('api/v2/ambassadors');

    let result;
    while(skip < total){
      let partialResponse = await ambassadors.find({
        query: {
          $sort: { account: 1 },
          $limit: limit,
          $skip: skip
        }
      });
      total = partialResponse.total;
      result === undefined ? result = partialResponse : partialResponse.data.map(this.fillResults(result));
      skip = skip + limit;
    }

    const markers = [];
    result.data.forEach(ambassador => {
      ambassador.cities.forEach(function(city) {
        const infoDescription = <div>
        <div><b>Location</b>: {(city.name).replace(/(^|\s)\S/g, l => l.toUpperCase())} - {countries.getName(city.country)}</div>
        {(ambassador.nickname) && (<div><b>Nickname</b>: {ambassador.nickname}</div>)}
        {(ambassador.telegram) && (<div><b>Telegram</b>:
          <a
            href={`https://t.me/${(ambassador.telegram.trim().charAt(0) === '@') ? ambassador.telegram.trim().slice(1): ambassador.telegram.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
          >{ambassador.telegram}</a>
          </div>)}
        {(ambassador.keybase) && (<div><b>Keybase</b>: {ambassador.keybase}</div>)}
        {(ambassador.email) && (<div><b>Email</b>: {ambassador.email}</div>)}
        {(ambassador.phone) && (<div><b>Phone</b>: {ambassador.phone}</div>)}
        {(ambassador.url) && (<div><b>URL:</b>: <a target="_blank" rel="noopener noreferrer"
          href={ambassador.url}>{stripProtocol(ambassador.url)}</a></div>)}
        </div>;
        const marker = {
          lat: city.lat,
          lng: city.lon,
          withInfo: true,
          infoTitle: ambassador.nickname,
          infoDescription: infoDescription,
        };
        markers.push(marker);
      });
    });

    // Once both return, update the state
    app.setState({ ambassadors: markers });
  };

  /**
   * @description Get merchants from the web service
   * @param {number} [limit=10] - Max items to be returned.
   * @param {number} [skip=0] - Start index search
   */
  getMerchants = async (limit = 50, skip = 0) => {
    const app = this;
    // Initially we don't know how much the total value is, so to make sure we enter the loop
    // at least once we're just setting it to be 1
    let total = 1;

    const merchants = Client.service('api/v1/merchants');

    let result;
    while(skip < total){
      let partialResponse = await merchants.find({
        query: {
          $sort: { account: 1 },
          $limit: limit,
          $skip: skip
        }
      });
      total = partialResponse.total;
      result === undefined ? result = partialResponse : partialResponse.data.map(this.fillResults(result));
      skip = skip + limit;
    }

    result.data.forEach(function(merchants){
      if(merchants.city !== undefined) merchants.city = (merchants.city).replace(/(^|\s)\S/g, l => l.toUpperCase());
      if(merchants.country !== undefined) merchants.country = countries.getName(merchants.country);
    });

    const markers = result.data.map(merchant => {
      const infoDescription = <div>
      <div><b>Address</b>: {merchant.address}</div>
      {(merchant.phone) && (<div><b>Phone</b>: {merchant.phone}</div>)}
      {(merchant.telegram) && (<div><b>Telegram</b>:
        <a
          href={`https://t.me/${(merchant.telegram.trim().charAt(0) === '@') ? merchant.telegram.trim().slice(1): merchant.telegram.trim()}`}
          target="_blank"
          rel="noopener noreferrer"
        >{merchant.telegram}</a>
        </div>)}
      {(merchant.website) && (<div><b>Website:</b>: <a target="_blank" rel="noopener noreferrer"
        href={merchant.website}>{stripProtocol(merchant.website)}</a></div>)}
      </div>;
      const marker = {
        lat: merchant.lat,
        lng: merchant.lon,
        withInfo: true,
        infoTitle: merchant.name,
        infoDescription: infoDescription,
      };
      return marker;
    });

    // Once both return, update the state
    app.setState({
      merchants: markers,
      loading: false
    });
  };

  /**
   * @description Get tellers from the web service
   * @param {number} [limit=10] - Max items to be returned.
   * @param {number} [skip=0] - Start index search
   */
  getTellers = async (limit = 50, skip = 0) => {
    const app = this;
    // Initially we don't know how much the total value is, so to make sure we enter the loop
    // at least once we're just setting it to be 1
    let total = 1;

    const tellers = Client.service('api/v2/tellers');
    this.setState({loading: true});
    let result;
    while(skip < total){
      let partialResponse = await tellers.find({
        query: {
          //$sort: { account: 1 },
          $limit: limit,
          $skip: skip
        }
      });
      total = partialResponse.total;
      result === undefined ? result = partialResponse : partialResponse.data.map(this.fillResults(result));
      skip = skip + limit;
    }

    result.data.forEach(function(tellers){
      if(tellers.city !== undefined) tellers.city = (tellers.city).replace(/(^|\s)\S/g, l => l.toUpperCase());
      if(tellers.country !== undefined) tellers.country = countries.getName(tellers.country);
    });

    const markers = result.data.map(merchant => {
      const infoDescription = <div>
      <div><b>Address</b>: {merchant.address}</div>
      {(merchant.phone) && (<div><b>Phone</b>: {merchant.phone}</div>)}
      {(merchant.telegram) && (<div><b>Telegram</b>:
        <a
          href={`https://t.me/${(merchant.telegram.trim().charAt(0) === '@') ? merchant.telegram.trim().slice(1): merchant.telegram.trim()}`}
          target="_blank"
          rel="noopener noreferrer"
        >{merchant.telegram}</a>
        </div>)}
      {(merchant.url) && (<div><b>Website:</b>: <a target="_blank" rel="noopener noreferrer"
        href={merchant.url}>{stripProtocol(merchant.url)}</a></div>)}
      </div>;
      const marker = {
        lat: merchant.lat,
        lng: merchant.lon,
        withInfo: true,
        infoTitle: merchant.gt_name,
        infoDescription: infoDescription,
      };
      return marker;
    });

    // Once both return, update the state
    app.setState({
      loading: false,
      tellers: markers
    });
  };

  handleLayerChange = name => event => {
    this.setState({ [name]: event.target.checked });
    // Update any time changes
    this.getAmbassadors();
    this.getMerchants();
    this.getTellers();
  };

  render() {
    // create an array with marker components

    return (
      <div>
        {!this.props.showControls ? (
          <LayerMapSwitches
            ambassadors={this.state.ambassadorLayer}
            merchants={this.state.merchantLayer}
            tellers={this.state.tellerLayer}
            onChange={this.handleLayerChange}
          />
        ) : (
          <div style={{ height: 56 }}></div>
        )}
        <CustomLayerMap
          ambassadors={this.state.ambassadorLayer ? this.state.ambassadors: []}
          merchants={this.state.merchantLayer ? this.state.merchants: []}
          tellers={this.state.tellerLayer ? this.state.tellers: []}
          mapZoom={3}
          mapCenter={{ lat: 0, lng: 0 }}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `100%` }} />}
          mapElement={<div style={{ height: this.props.mapHeight ? this.props.mapHeight: '400px' }} />}
        />
      </div>
    );
  }
}

export default LayerMap;
