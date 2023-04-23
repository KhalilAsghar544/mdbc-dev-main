// eslint-disable-next-line strict
const path = require("path");
const fs = require("fs");
const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");

exports.createUser = async (req, res) => {
    let enrollmentId = req.body.enrollmentId;
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'pharma.jnj.com', 'connection-pharma.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.pharma.jnj.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(enrollmentId);
        if (userIdentity) {
            res.json({
                status: false,
                message: `An identity for the user ${enrollmentId} already exists in the wallet`
            }, 500);
            return;
        }
        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            res.json({
                status: false,
                message: 'An identity for the admin user "admin" does not exist in the wallet'
            }, 500);
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');
        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'pharma.department1',
            enrollmentID: enrollmentId,
            role: 'client'
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: enrollmentId,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'PharmaMSP',
            type: 'X.509',
        };
        await wallet.put(enrollmentId, x509Identity);
        res.status(200).json({
            status: true,
            message: `Successfully registered and enrolled insurance user ${enrollmentId} and imported it into the wallet`
        });

    } catch (error) {
        res.json({
            status: false,
            message: `Failed to register user ${enrollmentId}: ${error}`
        }, 500);
        res.status(500).end();
    }
};
exports.verifyUser = async (req, res) => {
    let enrollmentId = req.params.enrollmentId;
    try {
        const walletPath = path.join(process.cwd(), 'walletPharma');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(enrollmentId);
        if (userIdentity) {
            res.status(200).json({
                status: true,
                message: `User ${enrollmentId} exists in the wallet`
            });
        } else {
            res.status(404).json({
                status: false,
                message: `User ${enrollmentId} not found in wallet`
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Failed to register user ${enrollmentId}: ${error}`
        });
    }
};