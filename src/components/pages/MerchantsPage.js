import React, { Component } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import sortBy from 'sort-by';

// Custom components
import AppHeader from '../AppHeader';
import EnhancedTable from '../EnhancedTable';
import Footer from '../Footer';
import LayerMap from '../LayerMap';
import PreviewMap from '../PreviewMap';
import { stripProtocol } from '../../utils/url';

// Helpers
import Client from '../../utils/feathers';
import Countries from 'country-list';

// Images
import LoadingGif from '../../assets/img/loading_icon.gif';
import MerchantPin from '../../assets/img/map/merchant_pin.png';

import { WHICH_OPTIONS } from '../../utils/constants';

import "./MerchantsPage.css";

// List of countries
const countries = Countries();

const centerStyle = {
  marginTop: 20,
  marginBottom: 20
};

const loadingStyle = {
  textAlign: 'center',
  marginTop: 20,
  marginBottom: 20,
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto'
};

const mapsStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    minWidth              : '300px'
  }
};

const columnData = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Name' },
  { id: 'address', numeric: false, disablePadding: true, label: 'Address' },
  { id: 'phone', numeric: false, disablePadding: true, label: 'Phone' },
  { id: 'telegram', numeric: false, disablePadding: true, label: 'Telegram' },
  { id: 'link', numeric: false, disablePadding: false, label: 'Website' },
  { id: 'map', numeric: false, disablePadding: false, label: 'Maps', disableSearch: true}
];

/**
 * Merchant page component.
 */
class MerchantsPage extends Component {
  constructor(props, context) {
    super(props, context);

    /** @type {ComponentState} */
    this.state = {
      merchants: {
        total: 0,
        limit: 0,
        skip: 0,
        data: []
      },
      merchantsSearch: [],
      ambassadorsMarkers: [],
      tellersMarkers: [],
      loading: true,
      rowsPerPage: [100,200,300],
      numberOfRows: 100,
      page: 1,
      total: undefined,
      dialogOpen: false,
      dialogMultipleOpen: false,
      modalIsOpen: false,
      mapsModalIsOpen: false,
      mapsTitle: '',
      mapsDescription: '',
      mapsLat: 0,
      mapsLon: 0
    };
  }

  /**
   * @description Lifecycle event handler called just after the App loads into the DOM.
   */
  UNSAFE_componentWillMount() {
    this.getAmbassadors();
    this.getMerchants();
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
    app.setState({ ambassadorsMarkers: markers });
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

    result.data.map(teller => {
      const infoDescription = <div>
        <div><b>Address</b>: {teller.address}</div>
        {(teller.phone) && (<div><b>Phone</b>: {teller.phone}</div>)}
        </div>;
      if(teller.telegram){
        teller.telegram_original = teller.telegram;
        teller.telegram = {
          searchText: teller.telegram_original,
          value: (
            <a
              href={`https://t.me/${(teller.telegram_original.trim().charAt(0) === '@') ?
                teller.telegram_original.trim().slice(1): teller.telegram_original.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
            >{teller.telegram}</a>
          )
        };
      }

      teller.link = {
        searchText: stripProtocol(teller.url),
        value: (
          <a target="_blank" rel="noopener noreferrer"
          href={teller.url}>{stripProtocol(teller.url)}</a>
        )
      };
      teller.location = {
        searchText: `${teller.country} - ${teller.city}`,
        value: (teller.city) ? `${teller.city} - ${teller.country}`: teller.country
      }
      teller.map = <Button
        className="App-button"
        variant="contained"
        style={{
            backgroundColor: "#fdcf09",
            color: 'white',
            whiteSpace: 'nowrap'
        }}
        onClick={() => this.openMaps(teller.gt_name, app.getTellerMarker(teller))}
      >Show on Map
      </Button>;
      return teller;
    });

    // Once both return, update the state
    app.setState({
      loading: false,
      tellersMarkers: result.data
    });
  };

  getTellerMarker = (teller) => {
    const which = WHICH_OPTIONS.filter(w => w.id.toLowerCase() === teller.which.toLowerCase());
      teller.which_value = ( teller.which && which.length > 0)  ?
        which[0].value :
        '';
    const infoDescription = (
      <div>
        <div><b>Address</b>: {teller.address}</div>
        {(teller.which) && (<div><b>Which:</b>: {teller.which}</div>)}
        {(teller.bitshares_address) && (<div><b>BTS Account:</b>: {teller.bitshares_address}</div>)}
        {(teller.address) && (<div><b>Address:</b>: {teller.address}</div>)}
        {(teller.telegram_original) && (<div><b>Telegram</b>:
          <a
            href={`https://t.me/${(teller.telegram_original.trim().charAt(0) === '@') ? teller.telegram_original.trim().slice(1): teller.telegram_original.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
          >{teller.telegram_original}</a>
          </div>)
        }
        {(teller.keybase) && (<div><b>Keybase</b>: {teller.keybase}</div>)}
        {(teller.whatsapp) && (<div><b>Whatsapp</b>: {teller.whatsapp}</div>)}
        {(teller.viber) && (<div><b>Viber</b>: {teller.viber}</div>)}
        {(teller.email) && (<div><b>Email</b>: {teller.email}</div>)}
        {(teller.phone) && (<div><b>Phone</b>: {teller.phone}</div>)}
        {(teller.url) && (<div><b>URL:</b>: <a target="_blank" rel="noopener noreferrer"
          href={teller.url}>{stripProtocol(teller.url)}</a></div>)}
      </div>
    );
    const marker = {
      lat: teller.lat,
      lng: teller.lon,
      withInfo: true,
      infoTitle: teller.gt_name,
      infoDescription: infoDescription,
    };
    return marker;
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
    this.setState({loading: true});
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

    result.data.map(merchant => {
      const infoDescription = <div>
        <div><b>Address</b>: {merchant.address}</div>
        {(merchant.phone) && (<div><b>Phone</b>: {merchant.phone}</div>)}
        </div>;
      if(merchant.telegram){
        merchant.telegram_original = merchant.telegram;
        merchant.telegram = {
          searchText: merchant.telegram,
          value: (
            <a
              href={`https://t.me/${(merchant.telegram.trim().charAt(0) === '@') ?
                merchant.telegram.trim().slice(1): merchant.telegram.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
            >{merchant.telegram}</a>
          )
        };
      }
      else{

      }

      merchant.link = {
        searchText: stripProtocol(merchant.website),
        value: (
          <a target="_blank" rel="noopener noreferrer"
          href={merchant.website}>{stripProtocol(merchant.website)}</a>
        )
      };
      merchant.location = {
        searchText: `${merchant.country} - ${merchant.city}`,
        value: (merchant.city) ? `${merchant.city} - ${merchant.country}`: merchant.country
      }
      merchant.map = <Button
        className="App-button"
        variant="contained"
        style={{
            backgroundColor: "#139657",
            color: 'white',
            whiteSpace: 'nowrap'
        }}
        onClick={() => this.openMaps(
          merchant.name,
          infoDescription,
          merchant.lat,
          merchant.lon
        )}
      >Show on Map
      </Button>;
      return merchant;
    });

    // Once both return, update the state
    app.setState({
      loading: false,
      merchants: result,
      merchantsSearch: result.data
    });
  };

  /**
   * @description Close Maps modal.
   */
  closeMapsModal() {
     this.setState({
       mapsLat: 0,
       mapsLon: 0,
       mapsModalIsOpen: false
     });
  }

  openMaps(name, address, lat, lon){
    this.setState({
      mapsTitle: name,
      mapsDescription: address,
      mapsLat: lat,
      mapsLon: lon,
      mapsModalIsOpen: true
    });
  }

  handleSearchChange(data){
    this.setState({ merchantsSearch: data });
  }

  render() {
    let { data: merchantsData } = this.state.merchants;
    const { ambassadorsMarkers, merchantsSearch } = this.state;

    const merchantMarkers = merchantsSearch.map(merchant => {
      const infoDescription = <div>
      <div><b>Address</b>: {merchant.address}</div>
      {(merchant.phone) && (<div><b>Phone</b>: {merchant.phone}</div>)}
      {(merchant.telegram_original) && (<div><b>Telegram</b>:
        <a
          href={`https://t.me/${(merchant.telegram_original.trim().charAt(0) === '@') ? merchant.telegram_original.trim().slice(1): merchant.telegram_original.trim()}`}
          target="_blank"
          rel="noopener noreferrer"
        >{merchant.telegram_original}</a>
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

    merchantsData = merchantsData.sort(sortBy('location.searchText'));

    const textComponent = (
      <span>
        <FormattedHTMLMessage id="merchants.description1" />
        <Link to="/ambs">
          <FormattedMessage id="merchants.ambassadors_link_description" />
        </Link>
        <FormattedHTMLMessage id="merchants.description2" />
      </span>
    );

    return (
      <div>
        <AppHeader />

      <section data-spy="scroll" data-target="#mainNav" id="services" className="merchants_services" >
      <div className="containerfix">
      <div className="row">
      <div className="col-md-10 mx-md-auto">

        <h2 className="ambassadorsTitle merchantsMargin" style={centerStyle}><FormattedMessage id="merchants.title" /></h2>
        { /* Conditional Rendering */}
            {(this.state.loading) ? (
              <img src={LoadingGif} alt="Loading" style={loadingStyle} />
        ): (
          <div>

            <Modal
              isOpen={this.state.mapsModalIsOpen}
              onRequestClose={() => this.closeMapsModal()}
              style={mapsStyles}
              ariaHideApp={false}
              contentLabel={this.state.mapsTitle}
            >
              <PreviewMap
                icon={MerchantPin}
                infoTitle={this.state.mapsTitle}
                infoDescription={this.state.mapsDescription}
                lat={this.state.mapsLat}
                lng={this.state.mapsLon}
                width="800px"
                height="600px"
              />
            </Modal>

            {(merchantsData.length > 0) ? (
              <div>
                <br />
                <EnhancedTable
                  description={textComponent}
                  columnData={columnData}
                  data={merchantsData}
                  orderBy="account"
                  rowsPerPage={10}
                  showSearchColumns={false}
                  isAdmin={false}
                  onSearchChange={(data) => this.handleSearchChange(data)}
                />
              </div>
            ) : (
              <div style={centerStyle}>No Data found</div>
            )}
            <div className="map">
              <LayerMap
                ambassadors={ambassadorsMarkers}
                merchants={merchantMarkers}
                ambassadorsLayer={false}
                merchantsLayer={true}
                tellersLayer={false}
                mapHeight={'600px'}
                showControls={this.state.mapsModalIsOpen}
              />
            </div>
          </div>
          )}
</div>
  </div>
  </div>
  </section>
        <Footer />
      </div>
    );
  }
}

export { MerchantsPage };
