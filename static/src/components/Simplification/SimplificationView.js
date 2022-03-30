import * as React from 'react';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions';
import Button from '@material-ui/core/Button';
import DragDrop from './DragDrop';

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators.default, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
class SimplificationView extends React.Component {
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
    const filenames = this.props.getFilenames();
    const data = await filenames.then((response) => response.data);

    this.setState({
      files: data.filenames,
    })
  }

  render() {
    return (
      <div className="files-view">
        <div style={{"marginTop": "20px"}}>
            <b>Upload a json file: </b>
            <DragDrop />
            <div style={{"marginTop": "20px"}}>
              <Button variant="outlined">Previous</Button>
              <Button variant="outlined">Next</Button>
              <Button variant="outlined">Exit</Button>
            </div>
        </div>
      </div>
    );
  }
}

export default SimplificationView;
