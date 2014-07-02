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

        public Process m_Process = null;
        void RunWithRedirect(string cmdPath, string args)
        {
            m_Process = new Process();
            m_Process.StartInfo.FileName = cmdPath;
            m_Process.StartInfo.Arguments = args;

            // set up output redirection
            m_Process.StartInfo.RedirectStandardOutput = true;
            m_Process.StartInfo.RedirectStandardError = true;
            m_Process.EnableRaisingEvents = true;
            m_Process.StartInfo.CreateNoWindow = true;
            m_Process.StartInfo.UseShellExecute = false;

            // see below for output handler
            m_Process.ErrorDataReceived += proc_DataReceived;
            m_Process.OutputDataReceived += proc_DataReceived;

            m_Process.Start();

            m_Process.BeginErrorReadLine();
            m_Process.BeginOutputReadLine();
        }

        void proc_DataReceived(object sender, DataReceivedEventArgs e)
        {
            MethodInvoker action = delegate
            { LogTextbox.AppendText(e.Data + "\r\n"); };
            LogTextbox.BeginInvoke(action);
        }

        private void ExportButton_Click(object sender, EventArgs e)
        {
            if(m_Process != null)
            {
                m_Process.Kill();
            }

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

            LogTextbox.Text = "";

            RunWithRedirect("fbx2obj2.exe", commandLine);
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            if (!File.Exists("fbx2obj2.exe"))
            {
                StatusLabel.Text = "fbx2obj2.exe NOT FOUND";
                ExportButton.Enabled = false;
                FBXPathTextbox.Enabled = false;
                BrowseFBXButton.Enabled = false;
            }
        }
    }
}
