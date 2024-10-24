import { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = '0xYourContractAddress';
const abi = [
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
    "function addEmergency(address admin) returns (bool)",
    "function removeEmergency(address admin) returns (bool)",
    "function isEmergencyAdmin(address admin) view returns (bool)"
];

function EmergencyAdmin({ provider }) {
    const [writableContract, setWritableContract] = useState();
    const [address, setAddress] = useState("");
    const [defaultAdminRole, setDefaultAdminRole] = useState("");
    const [newAdminAddress, setNewAdminAddress] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [removeAdminAddress, setRemoveAdminAddress] = useState("");

    useEffect(() => {
        if (!defaultAdminRole) { updateContractState(); }
        if (writableContract && newAdminAddress) { checkIfEmergencyAdmin(); }
    }, [defaultAdminRole, writableContract, newAdminAddress]);

    const setValue = (setter) => (evt) => setter(evt.target.value);

    async function updateContractState() {
        const readOnlyContract = new ethers.Contract(contractAddress, abi, provider);
        console.log(readOnlyContract);

        try {
            const defaultAdminRole = await readOnlyContract.DEFAULT_ADMIN_ROLE();
            setDefaultAdminRole(defaultAdminRole);
            console.log("Default Admin Role:", defaultAdminRole);
        } catch (error) {
            console.error('Error fetching admin role:', error);
        }
    }

    async function connectWallet(evt) {
        evt.preventDefault();
        try {
            const walletProvider = new ethers.BrowserProvider(window.ethereum);
            console.log(walletProvider);

            const signer = await walletProvider.getSigner();
            console.log("Wallet signer: ", signer);

            const address = signer.address;
            setAddress(address);
            console.log("Wallet address: ", address);

            const writableContract = new ethers.Contract(contractAddress, abi, signer);
            setWritableContract(writableContract);
            console.log("Writable contract: ", writableContract);
        } catch (error) {
            alert(error);
        }
    }

    async function addEmergencyAdmin(evt) {
        evt.preventDefault();
        if (!newAdminAddress) {
            alert("Please enter a valid admin address.");
            return;
        }

        try {
            console.log(writableContract);
            const tx = await writableContract.addEmergency(newAdminAddress);
            console.log('Transaction hash:', tx.hash);
            await tx.wait();
            console.log('Emergency admin added successfully');
        } catch (error) {
            console.error('Error adding emergency admin:', error);
            alert(error);
        }
    }

    async function removeEmergencyAdmin(evt) {
        evt.preventDefault();
        if (!removeAdminAddress) {
            alert("Please enter a valid admin address to remove.");
            return;
        }

        try {
            console.log(writableContract);
            const tx = await writableContract.removeEmergency(removeAdminAddress);
            console.log('Transaction hash:', tx.hash);
            await tx.wait();
            console.log('Emergency admin removed successfully');
        } catch (error) {
            console.error('Error removing emergency admin:', error);
            alert(error);
        }
    }

    async function checkIfEmergencyAdmin() {
        try {
            console.log(writableContract);
            const isAdmin = await writableContract.isEmergencyAdmin(newAdminAddress);
            setIsAdmin(isAdmin);
            console.log('Is Emergency Admin:', isAdmin);
        } catch (error) {
            console.error('Error checking emergency admin:', error);
        }
    }

    return (
        <>
            <div className="container">
                <h1>Emergency Admin Management</h1>
                <div className="role">DEFAULT ADMIN ROLE: {defaultAdminRole}</div>

                <form>
                    <input
                        type="submit"
                        className="button"
                        value="Connect Wallet"
                        onClick={connectWallet}
                    />
                    <label>Add Emergency Admin
                        <input
                            placeholder="Enter admin address"
                            value={newAdminAddress}
                            onChange={setValue(setNewAdminAddress)}
                        />
                    </label>
                    <input
                        type="submit"
                        className="button"
                        value="Add Admin"
                        onClick={addEmergencyAdmin}
                        disabled={!writableContract}
                    />
                    <div>
                        Is Admin: {isAdmin ? "Yes" : "No"}
                    </div>
                </form>

                <form>
                    <label>Remove Emergency Admin
                        <input
                            placeholder="Enter admin address to remove"
                            value={removeAdminAddress}
                            onChange={setValue(setRemoveAdminAddress)}
                        />
                    </label>
                    <input
                        type="submit"
                        className="button"
                        value="Remove Admin"
                        onClick={removeEmergencyAdmin}
                        disabled={!writableContract}
                    />
                </form>
            </div>
        </>
    );
}

export default EmergencyAdmin;