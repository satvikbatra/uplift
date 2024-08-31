const express = require('express');
const { userMiddleware } = require('../middleware/userMiddleware');
const { certificateSchemaZod } = require('../validation/certificates');
const { Certificate } = require('../models/certificates');
const { User } = require('../models/user');

const router = express.Router();

router.post('/add', userMiddleware, async(req, res) => {
    try {
        const data = req.body;
        const response = certificateSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs."
            });
        }

        const { platform, field, topic, description, verification_link, date } = req.body;

        const newCertificate = new Certificate({
            user: req.user._id,
            platform, 
            field,
            topic,
            description,
            verification_link,
            date
        });

        await newCertificate.save();

        await User.findByIdAndUpdate(
            req.user._id, 
            { $push: { certificates: newCertificate._id } }, 
            { new: true } 
        );
        
        return res.status(200).json({
            msg: "New certificate added successfully.",
            newCertificateId: newCertificate._id
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.get('/', userMiddleware, async (req, res) => {
    try {
        const certificates = await Certificate.find({ user: req.user._id });

        return res.status(200).json({
            certificates
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.get('/:id', userMiddleware, async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if(!certificate || certificate.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Certificate not found."
            });
        }

        return res.status(200).json({
            certificate: certificate
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.put('/:id', userMiddleware, async (req, res) => {
    try {
        const data = req.body;
        const response = certificateSchemaZod.safeParse(data);

        if(!response.success) {
            return res.status(411).json({
                msg: "You sent the wrong inputs."
            });
        }

        const { platform, field, topic, description, verification_link, date } = req.body;
        const certificate = await Certificate.findById(req.params.id);

        if(!certificate || certificate.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Certificate not found."
            });
        }

        certificate.platform = platform || certificate.platform;
        certificate.field = field || certificate.field;
        certificate.topic = topic || certificate.topic;
        certificate.description = description || certificate.description;
        certificate.verification_link = verification_link || certificate.verification_link;
        certificate.date = date || certificate.date;

        await certificate.save();

        return res.status(200).json({
            msg: "Certificate updated successfully."
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

router.delete('/:id', userMiddleware, async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if(!certificate || certificate.user.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                msg: "Certificate not found."
            });
        }

        await certificate.deleteOne();

        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { certificates: certificate._id } }
        );

        return res.status(200).json({
            msg: "Certificate deleted successfully."
        });

    } catch(err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;
