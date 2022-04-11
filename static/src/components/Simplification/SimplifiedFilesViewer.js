import * as React from 'react';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions';
import SimplifiedFileListItem from './SimplifiedFileListItem';

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators.default, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
class SimplifiedFilesViewer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
    };
  }

  componentDidMount() {
    this.fetchData()
  }

  async fetchData() {
    const filenames = this.props.getFilenames('simplified', '.json');
    const data = await filenames.then((response) => response.data);
    console.log(data);
    this.setState({
      files: data.filenames,
    })
  }

  handleRefresh = () => this.fetchData(); // handle refresh by re-fetching

  render() {
    return (
      <div className="files-view" style={{"marginTop": "20px"}}>
        <h1>Available Simplified Files</h1>
        <div className="files-list">
          {this.state.files.map(file => <SimplifiedFileListItem key={file} file={file} onClick={() => browserHistory.push(`/simplification/${file},${this.state.files.join(';')}`)} />)}
        </div>
      </div>
    );
  }
}

export default SimplifiedFilesViewer;
