//@flow

import React from "react";
import Grid from "@material-ui/core/Grid";
import { Paper, Divider, Typography, Button, Dialog } from "@material-ui/core";
import CategoryIcon from "@material-ui/icons/CategoryRounded";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import LangList from "./components/LangList";
import LangDetail from "./components/LangDetail";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import * as api from "./api";

type Props = {
  showSnack: (string, boolean) => void,
  showConfirmDialog: (string, () => void) => void
};
type State = {
  selectedIndex: number,
  langList: Array<{
    id: number,
    name: string
  }>,
  loaded: boolean,
  err: boolean,
  open: boolean,
  newEmpty: {
    name: boolean
  },
  newLang: {
    name: string
  }
};

class Language extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: -1,
      loaded: false,
      err: false,
      open: false,
      newEmpty: { name: false },
      langList: [],
      newLang: {
        name: ""
      }
    };
  }

  componentDidMount() {
    this.fetchAll();
  }

  fetchAll = () => {
    api
      .getAll()
      .then(m => {
        if (!m.data) {
          this.setState({
            loaded: true,
            err: true
          });
          this.props.showSnack("Could not load languages.", false);
        } else {
          const list = m.data.sort((a, b) => {
            return a.name < b.name ? -1 : 1;
          });
          this.setState({
            loaded: true,
            err: false,
            langList: m.data
          });
        }
      })
      .catch(e => {
        this.setState({
          loaded: true,
          err: true
        });
        this.props.showSnack("Could not load languages.", false);
        console.log(e);
      });
  };

  handleListItemClick = (event, id) => {
    this.setState({
      selectedIndex: id
    });
  };

  handleChange = (attribute, create) => event => {
    if (create) {
      const newCat = Object.assign({}, this.state.newLang);
      newCat[attribute] = event.target.value;
      const empty = Object.assign({}, this.state.newEmpty);
      empty[attribute] = event.target.value.length == 0;
      this.setState({
        newLang: newCat,
        newEmpty: empty
      });
    } else {
      const newList = this.state.langList;
      const newCat = Object.assign({}, newList[this.state.selectedIndex]);
      newCat[attribute] = event.target.value;
      newList[this.state.selectedIndex] = newCat;
      this.setState({
        lnagList: newList
      });
    }
  };

  handleClose = () => {
    this.setState({
      open: false
    });
  };

  saveLang = () => {
    const c = this.state.langList[this.state.selectedIndex];
    api
      .save(c, c.id)
      .then(c => {
        const newList = this.state.langList;
        newList[this.state.selectedIndex] = c.data;
        this.setState(
          {
            langList: newList
          },
          () => {
            this.props.showSnack("Success. Language updated.", true);
          }
        );
      })
      .catch(e => {
        this.props.showSnack("Error. Could not save language.", false);
      });
  };

  createLang = () => {
    api
      .create(this.state.newLang)
      .then(c => {
        this.setState(
          {
            open: false,
            newLang: { name: "" }
          },
          () => {
            this.fetchAll();
            this.props.showSnack("Success. Language created.", true);
          }
        );
      })
      .catch(e => {
        console.log(e);
        this.setState({
          newEmpty: {
            name: this.state.newLang.name == 0
          }
        });

        this.props.showSnack("Error. Could not create language.", false);
      });
  };

  callDeleteLang = () => {
    const dtl = this.state.langList[this.state.selectedIndex];
    this.props.showConfirmDialog(
      "Do you really want to delete language " + dtl.name + "?",
      () => {
        api
          .deleteLanguage(this.state.langList[this.state.selectedIndex].id)
          .then(c => {
            this.setState(
              {
                selectedIndex: -1
              },
              () => {
                this.fetchAll();
                this.props.showSnack("Success. Language removed.", true);
              }
            );
          })
          .catch(e => {
            this.props.showSnack("Error. Could not remove language.", false);
          });
      }
    );
  };

  render() {
    if (!this.state.loaded || this.state.err || !this.state.langList) {
      return <div />;
    }

    const dtl = this.state.langList[this.state.selectedIndex];
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={5} lg={5}>
          <Paper>
            <LangList
              selectedIndex={this.state.selectedIndex}
              handleListItemClick={this.handleListItemClick}
              items={this.state.langList}
            />
          </Paper>
          <br />
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                this.setState({
                  open: true
                });
              }}
            >
              Create New
            </Button>
            <Dialog
              open={this.state.open}
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {`Create new Language: ` + this.state.newLang.name}
              </DialogTitle>
              <DialogContent>
                <div style={{ minWidth: 552 }}>
                  <LangDetail
                    handleChangeBody={this.handleChange("description", true)}
                    handleChangeName={this.handleChange("name", true)}
                    handleSave={this.createLang}
                    detail={this.state.newLang}
                    create
                    nameError={this.state.newEmpty.name}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Grid>
        {this.state.langList.length > 0 && dtl && (
          <Grid item xs={12} sm={12} md={7} lg={7}>
            <Paper>
              <LangDetail
                handleChangeName={this.handleChange("name")}
                handleSave={this.saveLang}
                handleDelete={this.callDeleteLang}
                detail={dtl}
                nameError={dtl.name.length == 0}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  }
}

export default Language;
