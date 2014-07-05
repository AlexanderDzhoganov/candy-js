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
                m_Process.WaitForExit();
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
            var buildNavigationMesh = BuildNavigationMeshCheckbox.Checked;

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

            if (buildNavigationMesh)
            {
                args += " --build-navmesh";

                args += String.Format(" --navmesh-cell-size={0}", CellSizeTextbox.Text);
                args += String.Format(" --navmesh-cell-height={0}", CellHeightTextbox.Text);
                args += String.Format(" --navmesh-walkable-slope-angle={0}", WalkableSlopeAngleTextbox.Text);
                args += String.Format(" --navmesh-walkable-height={0}", WalkableHeightTextbox.Text);
                args += String.Format(" --navmesh-walkable-climb={0}", WalkableClimbTextbox.Text);
                args += String.Format(" --navmesh-walkable-radius={0}", WalkableRadiusTextbox.Text);
                args += String.Format(" --navmesh-max-edge-length={0}", MaxEdgeLengthTextbox.Text);
                args += String.Format(" --navmesh-max-simplification-error={0}", MaxSimplificationErrorTextbox.Text);
                args += String.Format(" --navmesh-min-region-area={0}", MinRegionAreaTextbox.Text);
                args += String.Format(" --navmesh-merge-region-area={0}", MergeRegionAreaTextbox.Text);
                args += String.Format(" --navmesh-max-verts-per-poly={0}", MaxVertsPerPolyTextbox.Text);
                args += String.Format(" --navmesh-detail-sample-distance={0}", DetailsampleDistanceTextbox.Text);
                args += String.Format(" --navmesh-detail-sample-max-error={0}", DetailSampleErrorTextbox.Text);
            }

            var inputFbx = FBXPathTextbox.Text;
            var commandLine = String.Format("{0} {1}", args, inputFbx);

            if (!File.Exists("fbx2obj2.exe"))
            {
                StatusLabel.Text = "fbx2obj2.exe NOT FOUND";
                return;
            }

            LogTextbox.Text = String.Format("Running with command-line: {0}", commandLine);

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

        private void textBox1_TextChanged(object sender, EventArgs e)
        {

        }

        private void textBox2_TextChanged(object sender, EventArgs e)
        {

        }

        private void label2_Click(object sender, EventArgs e)
        {

        }

        private void textBox10_TextChanged(object sender, EventArgs e)
        {

        }

        private void textBox7_TextChanged(object sender, EventArgs e)
        {

        }

        private void textBox8_TextChanged(object sender, EventArgs e)
        {

        }

        private void textBox9_TextChanged(object sender, EventArgs e)
        {

        }

        private void BuildNavigationMeshCheckbox_CheckedChanged(object sender, EventArgs e)
        {
            NavMeshSettingsGroupBox.Enabled = BuildNavigationMeshCheckbox.Checked;
        }
    }
}
