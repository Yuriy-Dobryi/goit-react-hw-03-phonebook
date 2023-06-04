import { Component } from "react";
import { nanoid } from "nanoid";
import { Notify } from 'notiflix';

import styles from './App.module.css'
import { ContactForm } from "./ContactForm/ContactForm";
import { Filter } from "./Filter/Filter";
import { ContactList } from "./ContactList/ContactList";

const DEFAULT_CONTACTS = [
  { id: nanoid(), name: 'Rosie Simpson', number: '459-12-56' },
  { id: nanoid(), name: 'Rosie Sompson', number: '145-23-65' },
  { id: nanoid(), name: 'Hermione Kline', number: '443-89-12' },
  { id: nanoid(), name: 'Eden Clements', number: '645-17-79' },
  { id: nanoid(), name: 'Annie Copeland', number: '227-91-26' },
  { id: nanoid(), name: 'Jack Shepart', number: '345-53-81' },
]

const CONTACTS_KEY = 'contacts';

export class App extends Component {
  state = {
    contacts: [],
    filter: '',
    isBtnShow: false,
  }

  componentDidMount() {
    setTimeout(() => {
      const localContacts = JSON.parse(localStorage.getItem(CONTACTS_KEY));
  
      if (localContacts && localContacts.length > 0) {
        this.setState({ contacts: [...localContacts] });
      } else {
        this.setState({ isBtnShow: true });
      }
    }, 500);
  }

  componentDidUpdate(_, prevState) {
    const { contacts, filter } = this.state;
    const isContactsChanged = contacts.length !== prevState.contacts.length;
    const isContactsEmpty = contacts.length === 0;

    if (isContactsChanged) {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify([...contacts]));
      setTimeout(() => {
        this.setState({ isBtnShow: isContactsEmpty });
      }, 500);
      
    } else if (prevState.filter !== filter) {
      const filteredContacts = contacts.filter(({ name }) => name.toLocaleLowerCase().includes(filter));
      this.checkEmptyContacts(filteredContacts.length, 'filter');
    }
  }
  
  addContact = (newContact) => {
    const { contacts } = this.state;
    const newContactName = newContact.name.toLocaleLowerCase();
    const isNewContactExist = contacts.some(({ name }) =>
      name.toLocaleLowerCase() === newContactName);
    
    if (isNewContactExist) {
      Notify.failure(`${newContact.name} is already in contacts.🧐`)
      return;
    }

    this.showOperationMessage(newContact.name, 'added');
    this.setState({ contacts: [...contacts, newContact] })
  }

  setDefaultContacts = () => {
    setTimeout(() => {
      this.setState({ contacts: [...DEFAULT_CONTACTS], filter: '' });
    }, 500);

    this.setState({ isBtnShow: false });
  }

  removeContact = (id, name) => {
    const { contacts } = this.state;
    const updatedContacts = contacts.filter((contact) =>
      contact.id !== id);

    this.setState({ contacts: [...updatedContacts] }, () => {
      this.showOperationMessage(name, 'removed')
      this.checkEmptyContacts(updatedContacts.length, 'remove');
    });
  }

  showOperationMessage = (contactName, typeOperation) => {
    Notify.success(`${contactName} has been ${typeOperation}`)
  }

  checkEmptyContacts = (contactsCount, typeOperation) => {
    if (contactsCount === 0) {
      Notify.info(typeOperation === 'remove'
        ? 'You deleted all contacts🙄'
        : 'No contacts with this name🤔');
    }
  }

  setFilter = (value) => {
    this.setState({ filter: value });
  };

  filterContacts = () => {
    const { contacts } = this.state;
    const filter = this.state.filter.toLocaleLowerCase();

    return filter
      ? contacts.filter(({ name }) => name.toLocaleLowerCase().includes(filter))
      : contacts
  }
  
  render() {
    const { contacts, filter, isBtnShow } = this.state;
    const filteredContacts = this.filterContacts();
    const isContactsEmpty = contacts.length === 0;

    return (
      <div className="container">
        <div className={styles.phonebook}>
          <h1 className={styles.title}>Phonebook</h1>
          <ContactForm
            addContact={this.addContact} />
        </div>

        <div>
          <h2 className={styles.title}>Contacts</h2>
          {isContactsEmpty
            ? isBtnShow
              ?
              <>
                <p>There is no contacts</p>
                <button className={styles.btn} onClick={this.setDefaultContacts}>Default Contacts</button>
              </>
              : <p>Loading . . .</p>
            : <Filter
              filter={filter}
              setFilter={this.setFilter} />}
          <ContactList
            contacts={filteredContacts}
            removeContact={this.removeContact} />
        </div>
      </div>
    )
  }
}