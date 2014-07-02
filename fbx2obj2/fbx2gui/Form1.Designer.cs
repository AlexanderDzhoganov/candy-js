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
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 19);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(51, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "Input .fbx";
            this.label1.Click += new System.EventHandler(this.label1_Click);
            // 
            // FBXPathTextbox
            // 
            this.FBXPathTextbox.Location = new System.Drawing.Point(69, 15);
            this.FBXPathTextbox.Name = "FBXPathTextbox";
            this.FBXPathTextbox.Size = new System.Drawing.Size(201, 20);
            this.FBXPathTextbox.TabIndex = 1;
            // 
            // BrowseFBXButton
            // 
            this.BrowseFBXButton.Location = new System.Drawing.Point(276, 14);
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
            this.VerboseLoggingCheckbox.Location = new System.Drawing.Point(69, 41);
            this.VerboseLoggingCheckbox.Name = "VerboseLoggingCheckbox";
            this.VerboseLoggingCheckbox.Size = new System.Drawing.Size(102, 17);
            this.VerboseLoggingCheckbox.TabIndex = 3;
            this.VerboseLoggingCheckbox.Text = "Verbose logging";
            this.VerboseLoggingCheckbox.UseVisualStyleBackColor = true;
            this.VerboseLoggingCheckbox.CheckedChanged += new System.EventHandler(this.VerboseLoggingCheckbox_CheckedChanged);
            // 
            // DontWriteResultCheckbox
            // 
            this.DontWriteResultCheckbox.AutoSize = true;
            this.DontWriteResultCheckbox.Location = new System.Drawing.Point(69, 110);
            this.DontWriteResultCheckbox.Name = "DontWriteResultCheckbox";
            this.DontWriteResultCheckbox.Size = new System.Drawing.Size(104, 17);
            this.DontWriteResultCheckbox.TabIndex = 4;
            this.DontWriteResultCheckbox.Text = "Don\'t write result";
            this.DontWriteResultCheckbox.UseVisualStyleBackColor = true;
            this.DontWriteResultCheckbox.CheckedChanged += new System.EventHandler(this.DontWriteResultCheckbox_CheckedChanged);
            // 
            // DontExportConversionLogCheckbox
            // 
            this.DontExportConversionLogCheckbox.AutoSize = true;
            this.DontExportConversionLogCheckbox.Location = new System.Drawing.Point(69, 87);
            this.DontExportConversionLogCheckbox.Name = "DontExportConversionLogCheckbox";
            this.DontExportConversionLogCheckbox.Size = new System.Drawing.Size(155, 17);
            this.DontExportConversionLogCheckbox.TabIndex = 5;
            this.DontExportConversionLogCheckbox.Text = "Don\'t export conversion log";
            this.DontExportConversionLogCheckbox.UseVisualStyleBackColor = true;
            this.DontExportConversionLogCheckbox.CheckedChanged += new System.EventHandler(this.DontExportConversionLogCheckbox_CheckedChanged);
            // 
            // PrintFBXInfoCheckbox
            // 
            this.PrintFBXInfoCheckbox.AutoSize = true;
            this.PrintFBXInfoCheckbox.Location = new System.Drawing.Point(69, 64);
            this.PrintFBXInfoCheckbox.Name = "PrintFBXInfoCheckbox";
            this.PrintFBXInfoCheckbox.Size = new System.Drawing.Size(165, 17);
            this.PrintFBXInfoCheckbox.TabIndex = 6;
            this.PrintFBXInfoCheckbox.Text = "Print FBX info (doesn\'t export)";
            this.PrintFBXInfoCheckbox.UseVisualStyleBackColor = true;
            this.PrintFBXInfoCheckbox.CheckedChanged += new System.EventHandler(this.PrintFBXInfoCheckbox_CheckedChanged);
            // 
            // DontExportAnimationCheckbox
            // 
            this.DontExportAnimationCheckbox.AutoSize = true;
            this.DontExportAnimationCheckbox.Location = new System.Drawing.Point(69, 133);
            this.DontExportAnimationCheckbox.Name = "DontExportAnimationCheckbox";
            this.DontExportAnimationCheckbox.Size = new System.Drawing.Size(131, 17);
            this.DontExportAnimationCheckbox.TabIndex = 7;
            this.DontExportAnimationCheckbox.Text = "Don\'t export animation";
            this.DontExportAnimationCheckbox.UseVisualStyleBackColor = true;
            this.DontExportAnimationCheckbox.CheckedChanged += new System.EventHandler(this.DontExportAnimationCheckbox_CheckedChanged);
            // 
            // IncludeIdentityFrameCheckbox
            // 
            this.IncludeIdentityFrameCheckbox.AutoSize = true;
            this.IncludeIdentityFrameCheckbox.Location = new System.Drawing.Point(69, 156);
            this.IncludeIdentityFrameCheckbox.Name = "IncludeIdentityFrameCheckbox";
            this.IncludeIdentityFrameCheckbox.Size = new System.Drawing.Size(174, 17);
            this.IncludeIdentityFrameCheckbox.TabIndex = 8;
            this.IncludeIdentityFrameCheckbox.Text = "Include animation identity frame";
            this.IncludeIdentityFrameCheckbox.UseVisualStyleBackColor = true;
            this.IncludeIdentityFrameCheckbox.CheckedChanged += new System.EventHandler(this.IncludeIdentityFrameCheckbox_CheckedChanged);
            // 
            // ExportButton
            // 
            this.ExportButton.Location = new System.Drawing.Point(229, 179);
            this.ExportButton.Name = "ExportButton";
            this.ExportButton.Size = new System.Drawing.Size(122, 23);
            this.ExportButton.TabIndex = 9;
            this.ExportButton.Text = "Export to .obj2";
            this.ExportButton.UseVisualStyleBackColor = true;
            this.ExportButton.Click += new System.EventHandler(this.ExportButton_Click);
            // 
            // LogTextbox
            // 
            this.LogTextbox.Location = new System.Drawing.Point(12, 208);
            this.LogTextbox.Multiline = true;
            this.LogTextbox.Name = "LogTextbox";
            this.LogTextbox.ReadOnly = true;
            this.LogTextbox.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.LogTextbox.Size = new System.Drawing.Size(338, 257);
            this.LogTextbox.TabIndex = 10;
            // 
            // StatusLabel
            // 
            this.StatusLabel.AutoSize = true;
            this.StatusLabel.Location = new System.Drawing.Point(9, 189);
            this.StatusLabel.Name = "StatusLabel";
            this.StatusLabel.Size = new System.Drawing.Size(117, 13);
            this.StatusLabel.TabIndex = 11;
            this.StatusLabel.Text = "Status: Waiting for user";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(362, 477);
            this.Controls.Add(this.StatusLabel);
            this.Controls.Add(this.LogTextbox);
            this.Controls.Add(this.ExportButton);
            this.Controls.Add(this.IncludeIdentityFrameCheckbox);
            this.Controls.Add(this.DontExportAnimationCheckbox);
            this.Controls.Add(this.PrintFBXInfoCheckbox);
            this.Controls.Add(this.DontExportConversionLogCheckbox);
            this.Controls.Add(this.DontWriteResultCheckbox);
            this.Controls.Add(this.VerboseLoggingCheckbox);
            this.Controls.Add(this.BrowseFBXButton);
            this.Controls.Add(this.FBXPathTextbox);
            this.Controls.Add(this.label1);
            this.Name = "Form1";
            this.Text = "Form1";
            this.Load += new System.EventHandler(this.Form1_Load);
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
    }
}

