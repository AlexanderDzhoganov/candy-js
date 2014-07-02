using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Diagnostics;

namespace fbx2gui
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void IncludeIdentityFrameCheckbox_CheckedChanged(object sender, EventArgs e)
        {

        }

        private void DontExportAnimationCheckbox_CheckedChanged(object sender, EventArgs e)
        {

        }

        private void DontWriteResultCheckbox_CheckedChanged(object sender, EventArgs e)
        {

        }

        private void DontExportConversionLogCheckbox_CheckedChanged(object sender, EventArgs e)
        {

        }

        private void PrintFBXInfoCheckbox_CheckedChanged(object sender, EventArgs e)
        {

        }

        private void VerboseLoggingCheckbox_CheckedChanged(object sender, EventArgs e)
        {

        }

        public OpenFileDialog openFileDialog = new OpenFileDialog();

        private void BrowseFBXButton_Click(object sender, EventArgs e)
        {
            var result = openFileDialog.ShowDialog();
            if(result == System.Windows.Forms.DialogResult.OK)
            {
                var filename = openFileDialog.FileName;
                var extension = Path.GetExtension(filename);

                if(extension != ".fbx")
                {
                    StatusLabel.Text = "Invalid format, expected .fbx";
                    return;
                }

                FBXPathTextbox.Text = filename;
            }
        }
        public static string ShellExecute(this string path, string command, TextWriter writer, params string[] arguments)
        {
            using (var process = Process.Start(new ProcessStartInfo { WorkingDirectory = path, FileName = command, Arguments = string.Join(" ", arguments), UseShellExecute = false, RedirectStandardOutput = true, RedirectStandardError = true }))
            {
                using (process.StandardOutput)
                {
                    writer.WriteLine(process.StandardOutput.ReadToEnd());
                }
                using (process.StandardError)
                {
                    writer.WriteLine(process.StandardError.ReadToEnd());
                }
            }

            return path;
        }

        private void ExportButton_Click(object sender, EventArgs e)
        {
            if(FBXPathTextbox.Text.Length == 0)
            {
                StatusLabel.Text = "Empty path!";
                return;
            }

            var verboseLogging = VerboseLoggingCheckbox.Checked;
            var printFbxInfo = PrintFBXInfoCheckbox.Checked;
            var dontExportConversionLog = DontExportConversionLogCheckbox.Checked;
            var dontExportAnimation = DontExportAnimationCheckbox.Checked;
            var dontWriteResult = DontWriteResultCheckbox.Checked;
            var includeIdentityFrame = IncludeIdentityFrameCheckbox.Checked;

            var args = "";

            if (verboseLogging)
            {
                args += " --log=verbose";
            }

            if (printFbxInfo)
            {
                args += " --print-fbx-info";
            }

            if (dontExportConversionLog)
            {
                args += " --no-conversion-log";
            }

            if (dontExportAnimation)
            {
                args += " --no-export-animation";
            }

            if (dontWriteResult)
            {
                args += " --no-file-write";
            }

            if (includeIdentityFrame)
            {
                args += " --include-identity-frame";
            }

            var inputFbx = FBXPathTextbox.Text;
            var commandLine = String.Format("{0} {1}", args, inputFbx);

            if (!File.Exists("fbx2obj2.exe"))
            {
                StatusLabel.Text = "fbx2obj2.exe NOT FOUND";
                return;
            }
            ShellExecute("fbx2obj2.exe", commandLine, Console.Out);
            StatusLabel.Text = "Converting..";
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            if (!File.Exists("fbx2obj2.exe"))
            {
                StatusLabel.Text = "fbx2obj2.exe NOT FOUND";
            }
        }
    }
}
