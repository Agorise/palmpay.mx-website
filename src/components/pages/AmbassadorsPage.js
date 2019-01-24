import React, { Component } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import sortBy from 'sort-by';

// Custom components
import AppHeader from '../AppHeader';
import Footer from '../Footer';
import EnhancedTable from '../EnhancedTable';
import LayerMap from '../LayerMap';
import PreviewMap from '../PreviewMap';

// Helpers
import Client from '../../utils/feathers';
import { stripProtocol } from '../../utils/url';
import Countries from 'country-list';

// Images
import AmbassadorPin from '../../assets/img/map/ambassador_pin.png';
import LoadingGif from '../../assets/img/loading_icon.gif';

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
  { id: 'nickname', numeric: false, disablePadding: true, label: 'Nickname' },
  { id: 'telegram', numeric: false, disablePadding: false, label: 'Telegram Account' },
  { id: 'keybase', numeric: false, disablePadding: false, label: 'Keybase' },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
  { id: 'phone', numeric: false, disablePadding: false, label: 'Phone' },
  { id: 'link', numeric: false, disablePadding: false, label: 'URL' },
  { id: 'location', numeric: false, disablePadding: true, label: 'Location' },
  { id: 'map', numeric: false, disablePadding: false, label: 'Maps', disableSearch: true}
];

/**
 * Ambassador page component.
 */
class AmbassadorsPage extends Component {
  constructor(props, context) {
    super(props, context);

    /** @type {ComponentState} */
    this.state = {
      ambassadors: {
        total: 0,
        limit: 0,
        skip: 0,
        data: []
      },
      ambassadorsSearch: [],
      merchantMarkers: [],
      loading: true,
      rowsPerPage: [100,200,300],
      numberOfRows: 100,
      page: 1,
      total: undefined,
      mapsModalIsOpen: false,
      mapsTitle: '',
      mapsDescription: '',
      mapsLat: 0,
      mapsLon: 0,
    };
  }

  /**
   * @description Lifecycle event handler called just after the App loads into the DOM.
   */
  UNSAFE_componentWillMount() {
    // Get the ambassadors list
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
    this.setState({loading: true});
    let result;
    while(skip < total){
      let partialResponse = await ambassadors.find({
        query: {
          $sort: { account: 1 },
          $limit: limit,
          $skip: skip,
          disabled: false
        }
      });
      total = partialResponse.total;
      result === undefined ? result = partialResponse : partialResponse.data.map(this.fillResults(result));
      skip = skip + limit;
    }

    // Add location and maps button
    result.data.forEach(function(ambassador){
      ambassador.location = {
        searchText: app.addLocationSearchText(ambassador.cities),
        value: app.addLocation(ambassador.cities)
      }
      ambassador.telegram_original = ambassador.telegram;
      ambassador.telegram = {
        searchText: ambassador.telegram,
        value: (
          <a
            href={`https://t.me/${(ambassador.telegram.trim().charAt(0) === '@') ?
              ambassador.telegram.trim().slice(1): ambassador.telegram.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
          >{ambassador.telegram}</a>
        )
      };
      ambassador.map = app.addMapButton(ambassador, ambassador.cities);
      ambassador.link = {
        searchText: stripProtocol(ambassador.url),
        value: (
          <a target="_blank" rel="noopener noreferrer"
          href={ambassador.url}>{stripProtocol(ambassador.url)}</a>
        )
      };
    });

    // Once both return, update the state
    app.setState({
      loading: false,
      ambassadors: result,
      ambassadorsSearch: result.data
    });
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
      merchantMarkers: markers
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

  addLocationSearchText(cities){
    let searchText = '';
    cities.forEach((location) => {
      searchText += `${countries.getName(location.country)} - ${(location.name).replace(/(^|\s)\S/g, l => l.toUpperCase())}`;
    });

    return searchText;
  }

  addLocation(cities){
    return (
      <span>
        {(cities.length > 1) && (<span><br /></span>)}
        {cities.map((location, index) => (
          <span key={index}>
            {`${(location.name).replace(/(^|\s)\S/g, l => l.toUpperCase())} - ${countries.getName(location.country)}`}
            {(cities.length > 1) && (<span><br /><br /></span>)}
          </span>
        ))}
      </span>
    );
  }

  addMapButton(ambassador, cities){
    const app = this;
    return (
      <span>
        {cities.map((location, index) => {
          const infoDescription = <div>
          <div><b>Location</b>: {(location.name).replace(/(^|\s)\S/g, l => l.toUpperCase())} - {countries.getName(location.country)}</div>
          {(ambassador.nickname) && (<div><b>Nickname</b>: {ambassador.nickname}</div>)}
          {(ambassador.telegram_original) && (<div><b>Telegram</b>:
            <a
              href={`https://t.me/${(ambassador.telegram_original.trim().charAt(0) === '@') ? ambassador.telegram_original.trim().slice(1): ambassador.telegram_original.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
            >{ambassador.telegram_original}</a>
            </div>)}
          {(ambassador.keybase) && (<div><b>Keybase</b>: {ambassador.keybase}</div>)}
          {(ambassador.email) && (<div><b>Email</b>: {ambassador.email}</div>)}
          {(ambassador.phone) && (<div><b>Phone</b>: {ambassador.phone}</div>)}
          {(ambassador.url) && (<div><b>URL:</b>: <a target="_blank" rel="noopener noreferrer"
            href={ambassador.url}>{stripProtocol(ambassador.url)}</a></div>)}
          </div>;
          return (
          <div key={index}>
            <Button
              className="App-button"
              variant="contained"
              style={{
                  backgroundColor: "#2069b3",
                  color: 'white',
                  marginTop: 5,
                  marginBottom: 5
              }}
              onClick={() => app.openMaps(
                ambassador.nickname,
                infoDescription,
                location.lat,
                location.lon
              )}
            >Show on Map
            </Button>
          </div>
        );})}
      </span>
    );
  }

  handleSearchChange(data){
    this.setState({ ambassadorsSearch: data });
  }

  render() {
    let { data } = this.state.ambassadors;
    const { ambassadorsSearch, merchantMarkers } = this.state;

    const ambassadorsMarkers = [];
    ambassadorsSearch.forEach(ambassador => {
      ambassador.cities.forEach(function(city) {
        const infoDescription = <div>
        <div><b>Location</b>: {(city.name).replace(/(^|\s)\S/g, l => l.toUpperCase())} - {countries.getName(city.country)}</div>
        {(ambassador.nickname) && (<div><b>Nickname</b>: {ambassador.nickname}</div>)}
        {(ambassador.telegram_original) && (<div><b>Telegram</b>: <a
          href={`https://t.me/${(ambassador.telegram_original.trim().charAt(0) === '@') ? ambassador.telegram_original.trim().slice(1): ambassador.telegram_original.trim()}`}
          target="_blank"
          rel="noopener noreferrer"
        >{ambassador.telegram_original}</a></div>)}
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
        ambassadorsMarkers.push(marker);
      });
    });

    data = data.sort(sortBy('nickname'));

    const textComponent = (
      <span>
        <FormattedHTMLMessage id="ambassadors.description1" />
        <Link to="/merchants">
        <FormattedMessage id="ambassadors.merchants_link_description" />
        </Link>
        <FormattedHTMLMessage id="ambassadors.description2" />
      </span>
    );

    return (
      <div>
        <AppHeader />

        <div id="maincontent">
      <section data-spy="scroll" data-target="#mainNav" id="services" className="ambs_services">
      <div className="containerfix">
      <div className="row">
      <div className="col-md-10 mx-md-auto">

        <h2 className="ambassadorsTitle" style={centerStyle}><FormattedMessage id="ambassadors.title" /></h2>
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
                icon={AmbassadorPin}
                infoTitle={this.state.mapsTitle}
                infoDescription={this.state.mapsDescription}
                lat={this.state.mapsLat}
                lng={this.state.mapsLon}
                width="800px"
                height="600px"
              />
            </Modal>
            {(data.length > 0) ? (
              <div>
                <br />
                <EnhancedTable
                  description={textComponent}
                  columnData={columnData}
                  data={data}
                  orderBy="Location"
                  showSearchColumns={false}
                  rowsPerPage={10}
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
                ambassadorsLayer={true}
                merchantsLayer={false}
                tellersLayer={false}
                mapHeight={'600px'}
                ambsMap={true}
                showControls={this.state.mapsModalIsOpen}
              />
            </div>
          </div>
        )}
</div>
  </div>
</div>
</section>
  </div>

        <Footer />
      </div>
    );
  }
}

export { AmbassadorsPage };
