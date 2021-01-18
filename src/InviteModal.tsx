import Modal from 'react-modal';

interface IInviteModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  joinGameLink: string;
}

Modal.setAppElement('#root');

const customStyles = {
  content : {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

export const InviteModal = (props: IInviteModalProps) => {
  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={props.onRequestClose}
      style={customStyles}
      shouldCloseOnOverlayClick={false}
    >
      <>
        <h1>Invite a friend</h1>
        <p>Copy link: <a target="_blank" href={props.joinGameLink}>{props.joinGameLink}</a></p>
        <button onClick={props.onRequestClose}>Close</button>
      </>
    </Modal>
  );
}