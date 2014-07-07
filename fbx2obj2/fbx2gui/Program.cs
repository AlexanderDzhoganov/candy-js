using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace fbx2gui
{

    [Serializable]
    public class FormConfiguration
    {
        public bool verboseLogging;
        public bool printFbxInfo;
        public bool dontExportConversionLog;
        public bool dontExportAnimation;
        public bool dontWriteResult;
        public bool includeIdentityFrame;
        public bool buildNavigationMesh;

        public string cellSize;
        public string cellHeight;
        public string walkableSlopeAngle;
        public string walkableHeight;
        public string walkableClimb;
        public string walkableRadius;
        public string maxEdgeLength;
        public string maxSimplificationError;
        public string minRegionArea;
        public string mergeRegionArea;
        public string maxVertsPerPoly;
        public string detailsampleDistance;
        public string detailSampleError;
    }

    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]  
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            var form1 = new Form1();
            Application.Run(form1);
        }
    }
}
