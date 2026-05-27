const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper to upload to Cloudinary from buffer
const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: "projects"
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
    try {
        const { title, date, category, snippet } = req.body;

        if (!title || !date || !category || !snippet) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const projectData = {
            title,
            date,
            category,
            snippet
        };

        // Upload image if provided
        if (req.file) {
            const result = await uploadFromBuffer(req.file.buffer);
            projectData.image = result.secure_url;
            projectData.imageId = result.public_id;
        }

        const newProject = await Project.create(projectData);

        res.status(201).json({
            success: true,
            data: newProject,
            message: 'Project created successfully'
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
    try {
        const { title, date, category, snippet } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Update basic fields
        if (title) project.title = title;
        if (date) project.date = date;
        if (category) project.category = category;
        if (snippet) project.snippet = snippet;

        // Update image if new one is provided
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (project.imageId) {
                await cloudinary.uploader.destroy(project.imageId);
            }

            const result = await uploadFromBuffer(req.file.buffer);
            project.image = result.secure_url;
            project.imageId = result.public_id;
        }

        await project.save();

        res.status(200).json({
            success: true,
            data: project,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Delete image from Cloudinary if it exists
        if (project.imageId) {
            await cloudinary.uploader.destroy(project.imageId);
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject
};
