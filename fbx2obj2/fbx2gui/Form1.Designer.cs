namespace fbx2gui
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.label1 = new System.Windows.Forms.Label();
            this.FBXPathTextbox = new System.Windows.Forms.TextBox();
            this.BrowseFBXButton = new System.Windows.Forms.Button();
            this.VerboseLoggingCheckbox = new System.Windows.Forms.CheckBox();
            this.DontWriteResultCheckbox = new System.Windows.Forms.CheckBox();
            this.DontExportConversionLogCheckbox = new System.Windows.Forms.CheckBox();
            this.PrintFBXInfoCheckbox = new System.Windows.Forms.CheckBox();
            this.DontExportAnimationCheckbox = new System.Windows.Forms.CheckBox();
            this.IncludeIdentityFrameCheckbox = new System.Windows.Forms.CheckBox();
            this.ExportButton = new System.Windows.Forms.Button();
            this.LogTextbox = new System.Windows.Forms.TextBox();
            this.StatusLabel = new System.Windows.Forms.Label();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.BuildNavigationMeshCheckbox = new System.Windows.Forms.CheckBox();
            this.NavMeshSettingsGroupBox = new System.Windows.Forms.GroupBox();
            this.DetailSampleErrorTextbox = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.DetailsampleDistanceTextbox = new System.Windows.Forms.TextBox();
            this.label6 = new System.Windows.Forms.Label();
            this.MaxVertsPerPolyTextbox = new System.Windows.Forms.TextBox();
            this.label9 = new System.Windows.Forms.Label();
            this.MergeRegionAreaTextbox = new System.Windows.Forms.TextBox();
            this.label13 = new System.Windows.Forms.Label();
            this.MinRegionAreaTextbox = new System.Windows.Forms.TextBox();
            this.label10 = new System.Windows.Forms.Label();
            this.MaxSimplificationErrorTextbox = new System.Windows.Forms.TextBox();
            this.label11 = new System.Windows.Forms.Label();
            this.MaxEdgeLengthTextbox = new System.Windows.Forms.TextBox();
            this.label12 = new System.Windows.Forms.Label();
            this.WalkableRadiusTextbox = new System.Windows.Forms.TextBox();
            this.label7 = new System.Windows.Forms.Label();
            this.WalkableClimbTextbox = new System.Windows.Forms.TextBox();
            this.label8 = new System.Windows.Forms.Label();
            this.WalkableHeightTextbox = new System.Windows.Forms.TextBox();
            this.WalkableHeightLabel = new System.Windows.Forms.Label();
            this.WalkableSlopeAngleTextbox = new System.Windows.Forms.TextBox();
            this.label3 = new System.Windows.Forms.Label();
            this.CellHeightTextbox = new System.Windows.Forms.TextBox();
            this.CellHeightLabel = new System.Windows.Forms.Label();
            this.CellSizeTextbox = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.SaveConfigurationButton = new System.Windows.Forms.Button();
            this.groupBox1.SuspendLayout();
            this.NavMeshSettingsGroupBox.SuspendLayout();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 18);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(51, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "Input .fbx";
            // 
            // FBXPathTextbox
            // 
            this.FBXPathTextbox.Location = new System.Drawing.Point(69, 15);
            this.FBXPathTextbox.Name = "FBXPathTextbox";
            this.FBXPathTextbox.Size = new System.Drawing.Size(536, 20);
            this.FBXPathTextbox.TabIndex = 1;
            // 
            // BrowseFBXButton
            // 
            this.BrowseFBXButton.Location = new System.Drawing.Point(611, 14);
            this.BrowseFBXButton.Name = "BrowseFBXButton";
            this.BrowseFBXButton.Size = new System.Drawing.Size(75, 20);
            this.BrowseFBXButton.TabIndex = 2;
            this.BrowseFBXButton.Text = "Browse";
            this.BrowseFBXButton.UseVisualStyleBackColor = true;
            this.BrowseFBXButton.Click += new System.EventHandler(this.BrowseFBXButton_Click);
            // 
            // VerboseLoggingCheckbox
            // 
            this.VerboseLoggingCheckbox.AutoSize = true;
            this.VerboseLoggingCheckbox.Location = new System.Drawing.Point(6, 19);
            this.VerboseLoggingCheckbox.Name = "VerboseLoggingCheckbox";
            this.VerboseLoggingCheckbox.Size = new System.Drawing.Size(102, 17);
            this.VerboseLoggingCheckbox.TabIndex = 3;
            this.VerboseLoggingCheckbox.Text = "Verbose logging";
            this.VerboseLoggingCheckbox.UseVisualStyleBackColor = true;
            // 
            // DontWriteResultCheckbox
            // 
            this.DontWriteResultCheckbox.AutoSize = true;
            this.DontWriteResultCheckbox.Location = new System.Drawing.Point(6, 88);
            this.DontWriteResultCheckbox.Name = "DontWriteResultCheckbox";
            this.DontWriteResultCheckbox.Size = new System.Drawing.Size(104, 17);
            this.DontWriteResultCheckbox.TabIndex = 4;
            this.DontWriteResultCheckbox.Text = "Don\'t write result";
            this.DontWriteResultCheckbox.UseVisualStyleBackColor = true;
            // 
            // DontExportConversionLogCheckbox
            // 
            this.DontExportConversionLogCheckbox.AutoSize = true;
            this.DontExportConversionLogCheckbox.Location = new System.Drawing.Point(6, 65);
            this.DontExportConversionLogCheckbox.Name = "DontExportConversionLogCheckbox";
            this.DontExportConversionLogCheckbox.Size = new System.Drawing.Size(155, 17);
            this.DontExportConversionLogCheckbox.TabIndex = 5;
            this.DontExportConversionLogCheckbox.Text = "Don\'t export conversion log";
            this.DontExportConversionLogCheckbox.UseVisualStyleBackColor = true;
            // 
            // PrintFBXInfoCheckbox
            // 
            this.PrintFBXInfoCheckbox.AutoSize = true;
            this.PrintFBXInfoCheckbox.Location = new System.Drawing.Point(6, 42);
            this.PrintFBXInfoCheckbox.Name = "PrintFBXInfoCheckbox";
            this.PrintFBXInfoCheckbox.Size = new System.Drawing.Size(165, 17);
            this.PrintFBXInfoCheckbox.TabIndex = 6;
            this.PrintFBXInfoCheckbox.Text = "Print FBX info (doesn\'t export)";
            this.PrintFBXInfoCheckbox.UseVisualStyleBackColor = true;
            // 
            // DontExportAnimationCheckbox
            // 
            this.DontExportAnimationCheckbox.AutoSize = true;
            this.DontExportAnimationCheckbox.Location = new System.Drawing.Point(6, 111);
            this.DontExportAnimationCheckbox.Name = "DontExportAnimationCheckbox";
            this.DontExportAnimationCheckbox.Size = new System.Drawing.Size(131, 17);
            this.DontExportAnimationCheckbox.TabIndex = 7;
            this.DontExportAnimationCheckbox.Text = "Don\'t export animation";
            this.DontExportAnimationCheckbox.UseVisualStyleBackColor = true;
            // 
            // IncludeIdentityFrameCheckbox
            // 
            this.IncludeIdentityFrameCheckbox.AutoSize = true;
            this.IncludeIdentityFrameCheckbox.Location = new System.Drawing.Point(6, 134);
            this.IncludeIdentityFrameCheckbox.Name = "IncludeIdentityFrameCheckbox";
            this.IncludeIdentityFrameCheckbox.Size = new System.Drawing.Size(174, 17);
            this.IncludeIdentityFrameCheckbox.TabIndex = 8;
            this.IncludeIdentityFrameCheckbox.Text = "Include animation identity frame";
            this.IncludeIdentityFrameCheckbox.UseVisualStyleBackColor = true;
            // 
            // ExportButton
            // 
            this.ExportButton.Location = new System.Drawing.Point(564, 318);
            this.ExportButton.Name = "ExportButton";
            this.ExportButton.Size = new System.Drawing.Size(122, 23);
            this.ExportButton.TabIndex = 9;
            this.ExportButton.Text = "Export to .obj2";
            this.ExportButton.UseVisualStyleBackColor = true;
            this.ExportButton.Click += new System.EventHandler(this.ExportButton_Click);
            // 
            // LogTextbox
            // 
            this.LogTextbox.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.LogTextbox.Location = new System.Drawing.Point(12, 347);
            this.LogTextbox.Multiline = true;
            this.LogTextbox.Name = "LogTextbox";
            this.LogTextbox.ReadOnly = true;
            this.LogTextbox.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.LogTextbox.Size = new System.Drawing.Size(674, 313);
            this.LogTextbox.TabIndex = 10;
            // 
            // StatusLabel
            // 
            this.StatusLabel.AutoSize = true;
            this.StatusLabel.Location = new System.Drawing.Point(12, 331);
            this.StatusLabel.Name = "StatusLabel";
            this.StatusLabel.Size = new System.Drawing.Size(117, 13);
            this.StatusLabel.TabIndex = 11;
            this.StatusLabel.Text = "Status: Waiting for user";
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.BuildNavigationMeshCheckbox);
            this.groupBox1.Controls.Add(this.VerboseLoggingCheckbox);
            this.groupBox1.Controls.Add(this.DontWriteResultCheckbox);
            this.groupBox1.Controls.Add(this.DontExportConversionLogCheckbox);
            this.groupBox1.Controls.Add(this.PrintFBXInfoCheckbox);
            this.groupBox1.Controls.Add(this.IncludeIdentityFrameCheckbox);
            this.groupBox1.Controls.Add(this.DontExportAnimationCheckbox);
            this.groupBox1.Location = new System.Drawing.Point(3, 51);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(267, 235);
            this.groupBox1.TabIndex = 12;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Export settings";
            // 
            // BuildNavigationMeshCheckbox
            // 
            this.BuildNavigationMeshCheckbox.AutoSize = true;
            this.BuildNavigationMeshCheckbox.Location = new System.Drawing.Point(6, 157);
            this.BuildNavigationMeshCheckbox.Name = "BuildNavigationMeshCheckbox";
            this.BuildNavigationMeshCheckbox.Size = new System.Drawing.Size(129, 17);
            this.BuildNavigationMeshCheckbox.TabIndex = 9;
            this.BuildNavigationMeshCheckbox.Text = "Build navigation mesh";
            this.BuildNavigationMeshCheckbox.UseVisualStyleBackColor = true;
            this.BuildNavigationMeshCheckbox.CheckedChanged += new System.EventHandler(this.BuildNavigationMeshCheckbox_CheckedChanged);
            // 
            // NavMeshSettingsGroupBox
            // 
            this.NavMeshSettingsGroupBox.Controls.Add(this.DetailSampleErrorTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label5);
            this.NavMeshSettingsGroupBox.Controls.Add(this.DetailsampleDistanceTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label6);
            this.NavMeshSettingsGroupBox.Controls.Add(this.MaxVertsPerPolyTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label9);
            this.NavMeshSettingsGroupBox.Controls.Add(this.MergeRegionAreaTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label13);
            this.NavMeshSettingsGroupBox.Controls.Add(this.MinRegionAreaTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label10);
            this.NavMeshSettingsGroupBox.Controls.Add(this.MaxSimplificationErrorTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label11);
            this.NavMeshSettingsGroupBox.Controls.Add(this.MaxEdgeLengthTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label12);
            this.NavMeshSettingsGroupBox.Controls.Add(this.WalkableRadiusTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label7);
            this.NavMeshSettingsGroupBox.Controls.Add(this.WalkableClimbTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label8);
            this.NavMeshSettingsGroupBox.Controls.Add(this.WalkableHeightTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.WalkableHeightLabel);
            this.NavMeshSettingsGroupBox.Controls.Add(this.WalkableSlopeAngleTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label3);
            this.NavMeshSettingsGroupBox.Controls.Add(this.CellHeightTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.CellHeightLabel);
            this.NavMeshSettingsGroupBox.Controls.Add(this.CellSizeTextbox);
            this.NavMeshSettingsGroupBox.Controls.Add(this.label2);
            this.NavMeshSettingsGroupBox.Enabled = false;
            this.NavMeshSettingsGroupBox.Location = new System.Drawing.Point(276, 56);
            this.NavMeshSettingsGroupBox.Name = "NavMeshSettingsGroupBox";
            this.NavMeshSettingsGroupBox.Size = new System.Drawing.Size(410, 230);
            this.NavMeshSettingsGroupBox.TabIndex = 13;
            this.NavMeshSettingsGroupBox.TabStop = false;
            this.NavMeshSettingsGroupBox.Text = "NavMesh settings";
            // 
            // DetailSampleErrorTextbox
            // 
            this.DetailSampleErrorTextbox.Location = new System.Drawing.Point(312, 190);
            this.DetailSampleErrorTextbox.MaxLength = 8;
            this.DetailSampleErrorTextbox.Name = "DetailSampleErrorTextbox";
            this.DetailSampleErrorTextbox.Size = new System.Drawing.Size(98, 20);
            this.DetailSampleErrorTextbox.TabIndex = 32;
            this.DetailSampleErrorTextbox.Text = "0.2";
            this.DetailSampleErrorTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(213, 193);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(85, 13);
            this.label5.TabIndex = 31;
            this.label5.Text = "Detail sample err";
            // 
            // DetailsampleDistanceTextbox
            // 
            this.DetailsampleDistanceTextbox.Location = new System.Drawing.Point(312, 164);
            this.DetailsampleDistanceTextbox.MaxLength = 8;
            this.DetailsampleDistanceTextbox.Name = "DetailsampleDistanceTextbox";
            this.DetailsampleDistanceTextbox.Size = new System.Drawing.Size(98, 20);
            this.DetailsampleDistanceTextbox.TabIndex = 30;
            this.DetailsampleDistanceTextbox.Text = "3.0";
            this.DetailsampleDistanceTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(213, 167);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(89, 13);
            this.label6.TabIndex = 29;
            this.label6.Text = "Detail sample dist";
            // 
            // MaxVertsPerPolyTextbox
            // 
            this.MaxVertsPerPolyTextbox.Enabled = false;
            this.MaxVertsPerPolyTextbox.Location = new System.Drawing.Point(312, 138);
            this.MaxVertsPerPolyTextbox.MaxLength = 8;
            this.MaxVertsPerPolyTextbox.Name = "MaxVertsPerPolyTextbox";
            this.MaxVertsPerPolyTextbox.Size = new System.Drawing.Size(98, 20);
            this.MaxVertsPerPolyTextbox.TabIndex = 28;
            this.MaxVertsPerPolyTextbox.Text = "3";
            this.MaxVertsPerPolyTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label9
            // 
            this.label9.AutoSize = true;
            this.label9.Location = new System.Drawing.Point(213, 141);
            this.label9.Name = "label9";
            this.label9.Size = new System.Drawing.Size(93, 13);
            this.label9.TabIndex = 27;
            this.label9.Text = "Max verts per poly";
            // 
            // MergeRegionAreaTextbox
            // 
            this.MergeRegionAreaTextbox.Location = new System.Drawing.Point(311, 112);
            this.MergeRegionAreaTextbox.MaxLength = 8;
            this.MergeRegionAreaTextbox.Name = "MergeRegionAreaTextbox";
            this.MergeRegionAreaTextbox.Size = new System.Drawing.Size(98, 20);
            this.MergeRegionAreaTextbox.TabIndex = 26;
            this.MergeRegionAreaTextbox.Text = "400";
            this.MergeRegionAreaTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label13
            // 
            this.label13.AutoSize = true;
            this.label13.Location = new System.Drawing.Point(212, 115);
            this.label13.Name = "label13";
            this.label13.Size = new System.Drawing.Size(93, 13);
            this.label13.TabIndex = 25;
            this.label13.Text = "Merge region area";
            // 
            // MinRegionAreaTextbox
            // 
            this.MinRegionAreaTextbox.Location = new System.Drawing.Point(311, 86);
            this.MinRegionAreaTextbox.MaxLength = 8;
            this.MinRegionAreaTextbox.Name = "MinRegionAreaTextbox";
            this.MinRegionAreaTextbox.Size = new System.Drawing.Size(98, 20);
            this.MinRegionAreaTextbox.TabIndex = 24;
            this.MinRegionAreaTextbox.Text = "64";
            this.MinRegionAreaTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label10
            // 
            this.label10.AutoSize = true;
            this.label10.Location = new System.Drawing.Point(212, 89);
            this.label10.Name = "label10";
            this.label10.Size = new System.Drawing.Size(80, 13);
            this.label10.TabIndex = 23;
            this.label10.Text = "Min region area";
            // 
            // MaxSimplificationErrorTextbox
            // 
            this.MaxSimplificationErrorTextbox.Location = new System.Drawing.Point(311, 60);
            this.MaxSimplificationErrorTextbox.MaxLength = 8;
            this.MaxSimplificationErrorTextbox.Name = "MaxSimplificationErrorTextbox";
            this.MaxSimplificationErrorTextbox.Size = new System.Drawing.Size(98, 20);
            this.MaxSimplificationErrorTextbox.TabIndex = 22;
            this.MaxSimplificationErrorTextbox.Text = "1.3";
            this.MaxSimplificationErrorTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label11
            // 
            this.label11.AutoSize = true;
            this.label11.Location = new System.Drawing.Point(212, 63);
            this.label11.Name = "label11";
            this.label11.Size = new System.Drawing.Size(80, 13);
            this.label11.TabIndex = 21;
            this.label11.Text = "Max simpl. error";
            // 
            // MaxEdgeLengthTextbox
            // 
            this.MaxEdgeLengthTextbox.Location = new System.Drawing.Point(311, 34);
            this.MaxEdgeLengthTextbox.MaxLength = 8;
            this.MaxEdgeLengthTextbox.Name = "MaxEdgeLengthTextbox";
            this.MaxEdgeLengthTextbox.Size = new System.Drawing.Size(98, 20);
            this.MaxEdgeLengthTextbox.TabIndex = 20;
            this.MaxEdgeLengthTextbox.Text = "40";
            this.MaxEdgeLengthTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label12
            // 
            this.label12.AutoSize = true;
            this.label12.Location = new System.Drawing.Point(212, 37);
            this.label12.Name = "label12";
            this.label12.Size = new System.Drawing.Size(86, 13);
            this.label12.TabIndex = 19;
            this.label12.Text = "Max edge length";
            // 
            // WalkableRadiusTextbox
            // 
            this.WalkableRadiusTextbox.Location = new System.Drawing.Point(100, 190);
            this.WalkableRadiusTextbox.MaxLength = 8;
            this.WalkableRadiusTextbox.Name = "WalkableRadiusTextbox";
            this.WalkableRadiusTextbox.Size = new System.Drawing.Size(98, 20);
            this.WalkableRadiusTextbox.TabIndex = 18;
            this.WalkableRadiusTextbox.Text = "1";
            this.WalkableRadiusTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(6, 193);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(83, 13);
            this.label7.TabIndex = 17;
            this.label7.Text = "Walkable radius";
            // 
            // WalkableClimbTextbox
            // 
            this.WalkableClimbTextbox.Location = new System.Drawing.Point(100, 164);
            this.WalkableClimbTextbox.MaxLength = 8;
            this.WalkableClimbTextbox.Name = "WalkableClimbTextbox";
            this.WalkableClimbTextbox.Size = new System.Drawing.Size(98, 20);
            this.WalkableClimbTextbox.TabIndex = 16;
            this.WalkableClimbTextbox.Text = "3";
            this.WalkableClimbTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label8
            // 
            this.label8.AutoSize = true;
            this.label8.Location = new System.Drawing.Point(6, 167);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(79, 13);
            this.label8.TabIndex = 15;
            this.label8.Text = "Walkable climb";
            // 
            // WalkableHeightTextbox
            // 
            this.WalkableHeightTextbox.Location = new System.Drawing.Point(100, 138);
            this.WalkableHeightTextbox.MaxLength = 8;
            this.WalkableHeightTextbox.Name = "WalkableHeightTextbox";
            this.WalkableHeightTextbox.Size = new System.Drawing.Size(98, 20);
            this.WalkableHeightTextbox.TabIndex = 14;
            this.WalkableHeightTextbox.Text = "3";
            this.WalkableHeightTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // WalkableHeightLabel
            // 
            this.WalkableHeightLabel.AutoSize = true;
            this.WalkableHeightLabel.Location = new System.Drawing.Point(6, 141);
            this.WalkableHeightLabel.Name = "WalkableHeightLabel";
            this.WalkableHeightLabel.Size = new System.Drawing.Size(84, 13);
            this.WalkableHeightLabel.TabIndex = 13;
            this.WalkableHeightLabel.Text = "Walkable height";
            // 
            // WalkableSlopeAngleTextbox
            // 
            this.WalkableSlopeAngleTextbox.Location = new System.Drawing.Point(100, 112);
            this.WalkableSlopeAngleTextbox.MaxLength = 8;
            this.WalkableSlopeAngleTextbox.Name = "WalkableSlopeAngleTextbox";
            this.WalkableSlopeAngleTextbox.Size = new System.Drawing.Size(98, 20);
            this.WalkableSlopeAngleTextbox.TabIndex = 6;
            this.WalkableSlopeAngleTextbox.Text = "45.0";
            this.WalkableSlopeAngleTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(6, 115);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(81, 13);
            this.label3.TabIndex = 5;
            this.label3.Text = "Walkable angle";
            // 
            // CellHeightTextbox
            // 
            this.CellHeightTextbox.Location = new System.Drawing.Point(100, 60);
            this.CellHeightTextbox.MaxLength = 8;
            this.CellHeightTextbox.Name = "CellHeightTextbox";
            this.CellHeightTextbox.Size = new System.Drawing.Size(98, 20);
            this.CellHeightTextbox.TabIndex = 4;
            this.CellHeightTextbox.Text = "0.2";
            this.CellHeightTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // CellHeightLabel
            // 
            this.CellHeightLabel.AutoSize = true;
            this.CellHeightLabel.Location = new System.Drawing.Point(6, 63);
            this.CellHeightLabel.Name = "CellHeightLabel";
            this.CellHeightLabel.Size = new System.Drawing.Size(56, 13);
            this.CellHeightLabel.TabIndex = 3;
            this.CellHeightLabel.Text = "Cell height";
            // 
            // CellSizeTextbox
            // 
            this.CellSizeTextbox.Location = new System.Drawing.Point(100, 34);
            this.CellSizeTextbox.MaxLength = 8;
            this.CellSizeTextbox.Name = "CellSizeTextbox";
            this.CellSizeTextbox.Size = new System.Drawing.Size(98, 20);
            this.CellSizeTextbox.TabIndex = 2;
            this.CellSizeTextbox.Text = "0.3";
            this.CellSizeTextbox.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(6, 37);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(45, 13);
            this.label2.TabIndex = 1;
            this.label2.Text = "Cell size";
            // 
            // SaveConfigurationButton
            // 
            this.SaveConfigurationButton.Location = new System.Drawing.Point(436, 318);
            this.SaveConfigurationButton.Name = "SaveConfigurationButton";
            this.SaveConfigurationButton.Size = new System.Drawing.Size(122, 23);
            this.SaveConfigurationButton.TabIndex = 14;
            this.SaveConfigurationButton.Text = "Save configuration";
            this.SaveConfigurationButton.UseVisualStyleBackColor = true;
            this.SaveConfigurationButton.Click += new System.EventHandler(this.SaveConfigurationButton_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(698, 672);
            this.Controls.Add(this.SaveConfigurationButton);
            this.Controls.Add(this.NavMeshSettingsGroupBox);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.StatusLabel);
            this.Controls.Add(this.LogTextbox);
            this.Controls.Add(this.ExportButton);
            this.Controls.Add(this.BrowseFBXButton);
            this.Controls.Add(this.FBXPathTextbox);
            this.Controls.Add(this.label1);
            this.Name = "Form1";
            this.Text = "FBX2OBJ2";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.NavMeshSettingsGroupBox.ResumeLayout(false);
            this.NavMeshSettingsGroupBox.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox FBXPathTextbox;
        private System.Windows.Forms.Button BrowseFBXButton;
        private System.Windows.Forms.CheckBox VerboseLoggingCheckbox;
        private System.Windows.Forms.CheckBox DontWriteResultCheckbox;
        private System.Windows.Forms.CheckBox DontExportConversionLogCheckbox;
        private System.Windows.Forms.CheckBox PrintFBXInfoCheckbox;
        private System.Windows.Forms.CheckBox DontExportAnimationCheckbox;
        private System.Windows.Forms.CheckBox IncludeIdentityFrameCheckbox;
        private System.Windows.Forms.Button ExportButton;
        private System.Windows.Forms.TextBox LogTextbox;
        private System.Windows.Forms.Label StatusLabel;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.CheckBox BuildNavigationMeshCheckbox;
        private System.Windows.Forms.GroupBox NavMeshSettingsGroupBox;
        private System.Windows.Forms.TextBox CellHeightTextbox;
        private System.Windows.Forms.Label CellHeightLabel;
        private System.Windows.Forms.TextBox CellSizeTextbox;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.TextBox WalkableSlopeAngleTextbox;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox MergeRegionAreaTextbox;
        private System.Windows.Forms.Label label13;
        private System.Windows.Forms.TextBox MinRegionAreaTextbox;
        private System.Windows.Forms.Label label10;
        private System.Windows.Forms.TextBox MaxSimplificationErrorTextbox;
        private System.Windows.Forms.Label label11;
        private System.Windows.Forms.TextBox MaxEdgeLengthTextbox;
        private System.Windows.Forms.Label label12;
        private System.Windows.Forms.TextBox WalkableRadiusTextbox;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.TextBox WalkableClimbTextbox;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.TextBox WalkableHeightTextbox;
        private System.Windows.Forms.Label WalkableHeightLabel;
        private System.Windows.Forms.TextBox DetailSampleErrorTextbox;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.TextBox DetailsampleDistanceTextbox;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.TextBox MaxVertsPerPolyTextbox;
        private System.Windows.Forms.Label label9;
        private System.Windows.Forms.Button SaveConfigurationButton;
    }
}

